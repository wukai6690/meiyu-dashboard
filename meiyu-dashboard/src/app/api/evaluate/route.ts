import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const PROMPT = `你是一位专业的K12美术教育专家。请分析这幅学生美术作品，从以下五个维度进行评价，每个维度给出1-3分（1=初级，2=中级，3=高级）：

1. 构图（画面布局、结构安排）
2. 色彩（色彩搭配、运用能力）
3. 造型（形象塑造、线条处理）
4. 创意（想象力、独特性）
5. 完整性（细节处理、完成度）

请以JSON格式返回：
{
  "score_composition": 评分数字,
  "score_color": 评分数字,
  "score_modeling": 评分数字,
  "score_creativity": 评分数字,
  "score_completeness": 评分数字,
  "total_score": 总分数字,
  "feedback": "一段50字左右的评价语，鼓励为主"
}`;

export async function POST(req: NextRequest) {
  try {
    const { artwork_id, image_url } = await req.json();
    if (!artwork_id || !image_url) {
      return NextResponse.json({ error: 'Missing artwork_id or image_url' }, { status: 400 });
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey || apiKey === 'sk-dummy-key-replace-me') {
      return NextResponse.json({ 
        score_composition: 2, score_color: 2, score_modeling: 2, 
        score_creativity: 2, score_completeness: 2, total_score: 10, 
        feedback: 'AI评价功能已配置，请设置DASHSCOPE_API_KEY以启用真实AI评价。',
        mock: true 
      });
    }

    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-vl-max',
        messages: [
          { role: 'system', content: PROMPT },
          { role: 'user', content: [{ type: 'image_url', image_url: { url: image_url } }] }
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `DashScope error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    
    const scores = JSON.parse(jsonMatch[0]);
    const grades: Record<string, string> = { '15': '杰出', '14': '优秀', '13': '良好', '12': '良好', '11': '一般', '10': '一般' };
    
    const grade = grades[scores.total_score] || (scores.total_score >= 14 ? '杰出' : scores.total_score >= 12 ? '优秀' : scores.total_score >= 10 ? '良好' : '一般');

    const supabase = await createAdminClient();
    const { error } = await supabase.from('evaluations').upsert({
      artwork_id,
      score_composition: scores.score_composition,
      score_color: scores.score_color,
      score_modeling: scores.score_modeling,
      score_creativity: scores.score_creativity,
      score_completeness: scores.score_completeness,
      total_score: scores.total_score,
      grade,
      ai_feedback: scores.feedback,
      ai_raw_json: scores,
      status: 'pending_review',
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, ...scores, grade });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
