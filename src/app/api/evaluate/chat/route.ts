import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { image_url, image_data, question, history, evaluation_context } = await req.json();
    const imageSource = image_data || image_url;
    if (!imageSource || !question) {
      return NextResponse.json({ error: 'Missing image and question' }, { status: 400 });
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;

    const evalSummary = evaluation_context
      ? `这幅AI评价过的作品——总分${evaluation_context.total_score}/15，评级${evaluation_context.grade}。各维度得分：${JSON.stringify(evaluation_context.dimensions || {})}`
      : '';

    // Build conversation: image only in first message, rest are text-only
    const chatMessages: Array<Record<string, unknown>> = [
      {
        role: 'system',
        content: `你是K12美术教育导师，正在和学生讨论一幅美术作品。

对话风格：温暖、专业、具体。尽量围绕这幅作品展开讨论，但也可以回答一般的绘画学习问题。

${evalSummary}

当前对话中，学生上传了一幅作品并获得了AI评价。请基于评价结果和作品本身回答问题。回答简洁（100-150字），有画面细节就不要空谈理论。`,
      },
    ];

    // Add history as text-only context (no images in history)
    const historyTexts: string[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        historyTexts.push(`${msg.role === 'user' ? '学生' : '导师'}: ${msg.content}`);
      }
      if (historyTexts.length > 0) {
        chatMessages.push({
          role: 'user',
          content: `之前的对话记录：\n${historyTexts.join('\n')}\n\n基于以上对话，学生的新问题是：${question}`,
        });
      }
    }

    // Current message with image (only if no history or this is first message)
    if (historyTexts.length === 0) {
      chatMessages.push({
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageSource } },
          { type: 'text', text: question },
        ],
      });
    } else {
      // For follow-up questions, just send text (AI already saw the image earlier)
      chatMessages.push({
        role: 'user',
        content: question,
      });
    }

    if (!apiKey || apiKey === 'sk-dummy-key-replace-me') {
      return NextResponse.json({
        answer: generateMockAnswer(question, history, evaluation_context),
        mock: true,
      });
    }

    const response = await fetch(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-vl-max',
          messages: chatMessages,
          max_tokens: 300,
          temperature: 0.5,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('DashScope chat error:', response.status, errText);
      return NextResponse.json({
        answer: generateMockAnswer(question, history, evaluation_context),
      });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '抱歉，我没能理解你的问题，换个方式再问一次吧？';

    return NextResponse.json({ answer, mock: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown';
    console.error('Chat error:', message);
    return NextResponse.json({
      answer: 'AI服务暂时繁忙，请稍后再试。',
      mock: true,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateMockAnswer(question: string, history?: any[], ctx?: Record<string, unknown>): string {
  const q = question.toLowerCase();
  const dims = ctx?.dimensions as Record<string, { score: number; feedback: string }> | undefined;

  // Use best/worst dim from context if available
  const dimNames = ['构图', '色彩', '造型', '创意', '完整性'];
  const bestDim = dims ? dimNames.reduce((a, b) => (dims[a]?.score >= dims[b]?.score ? a : b)) : '创意';
  const worstDim = dims ? dimNames.reduce((a, b) => (dims[a]?.score <= dims[b]?.score ? a : b)) : '完整性';
  const bestFb = dims?.[bestDim]?.feedback || '';
  const worstFb = dims?.[worstDim]?.feedback || '';
  const grade = ctx?.grade || '优秀';
  const total = ctx?.total_score || 12;

  // Check if this is a follow-up question
  const prevQuestions = history?.filter(m => m.role === 'user').map(m => m.content.toLowerCase()) || [];
  const isFollowUp = prevQuestions.length > 0;

  if (q.includes('为什么') || q.includes('评分') || q.includes('分数')) {
    if (q.includes(bestDim)) {
      return `${bestDim}给了较高评价，原因：${bestFb || '这里确实处理得不错，能在画面中看到用心的痕迹'}。总分${total}/15属于${grade}水平，这个维度是你的加分项。`;
    }
    if (q.includes(worstDim)) {
      return `${worstDim}评分相对低一些，原因：${worstFb || '这里还有进步空间，不要气馁'}。不过总分${total}/15已经达到${grade}水平了，这个维度正是你下一步的突破口。`;
    }
    return `这幅作品总分${total}/15，评级${grade}。最突出的维度是${bestDim}，最有提升空间的是${worstDim}。你想具体了解哪个维度？`;
  }

  if (q.includes(bestDim) || q.includes('好') || q.includes('亮点') || q.includes('优点')) {
    return `${bestDim}是最突出的维度。${bestFb || '处理得很用心，有自己的风格在里面'}。这是你的强项，继续保持，也可以在这个方向上尝试更多变化和挑战。`;
  }

  if (q.includes(worstDim) || q.includes('不足') || q.includes('改进') || q.includes('提升')) {
    return `建议多关注${worstDim}。${worstFb || '每次画画时多检查这个方面，慢慢就会看到进步'}。试试下次创作前先花5分钟专门练习这个维度，进步会很明显的！`;
  }

  if (q.includes('总') || q.includes('整体') || q.includes('怎么样')) {
    return `整体来说这幅作品达到${grade}水平（${total}/15分）。${bestDim}是你的强项，${worstDim}还有提升空间。每一笔都是成长，继续加油！你想深入了解哪个方面？`;
  }

  // Generic but warm response for follow-up or new questions
  if (isFollowUp) {
    return `关于你问的这个问题，联系到这幅作品——${bestDim}表现不错，${worstDim}值得多花时间练习。你想我展开讲讲哪个方向？`;
  }

  return `这是个好问题！这幅作品在${bestDim}上给人留下了印象，${worstDim}还可以继续探索。你想具体聊聊哪个维度？`;
}
