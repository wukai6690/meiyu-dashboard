import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { buildEvaluationPrompt, smartMockEvaluate } from '@/lib/prompts';

export const runtime = 'edge';
export const maxDuration = 30;

function parseAIResponse(content: string): Record<string, unknown> | null {
  // Try direct JSON parse first
  try {
    return JSON.parse(content);
  } catch {
    // noop
  }

  // Try to extract JSON from markdown code blocks
  const jsonBlock = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlock) {
    try {
      return JSON.parse(jsonBlock[1].trim());
    } catch {
      // noop
    }
  }

  // Try to find JSON object in text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // noop
    }
  }

  return null;
}

function normalizeEvaluation(parsed: Record<string, unknown>): Record<string, unknown> {
  // New format: { composition: { score, level, feedback }, ... }
  const dimKeys = ['composition', 'color', 'modeling', 'creativity', 'completeness'];
  const dimNames: Record<string, string> = {
    composition: '构图',
    color: '色彩',
    modeling: '造型',
    creativity: '创意',
    completeness: '完整性',
  };

  const dimensions: Record<string, { score: number; level: string; feedback: string }> = {};

  for (const key of dimKeys) {
    const dim = parsed[key] as Record<string, unknown> | undefined;
    if (dim && typeof dim.score === 'number') {
      dimensions[dimNames[key]] = {
        score: Math.max(1, Math.min(3, dim.score)),
        level: (dim.level as string) || (dim.score >= 3 ? '优秀' : dim.score >= 2 ? '达标' : '待提升'),
        feedback: (dim.feedback as string) || '',
      };
    }
  }

  // If new format parsing failed, try old format fallback
  if (Object.keys(dimensions).length === 0) {
    const oldMap = {
      score_composition: '构图',
      score_color: '色彩',
      score_modeling: '造型',
      score_creativity: '创意',
      score_completeness: '完整性',
    };
    for (const [oldKey, dimName] of Object.entries(oldMap)) {
      const score = typeof parsed[oldKey] === 'number' ? parsed[oldKey] : 2;
      dimensions[dimName] = {
        score: Math.max(1, Math.min(3, score as number)),
        level: (score as number) >= 3 ? '优秀' : (score as number) >= 2 ? '达标' : '待提升',
        feedback: '',
      };
    }
  }

  const totalScore =
    typeof parsed.total_score === 'number'
      ? parsed.total_score
      : Object.values(dimensions).reduce((s, d) => s + d.score, 0);

  const grade =
    totalScore >= 14 ? '杰出' : totalScore >= 12 ? '优秀' : totalScore >= 10 ? '良好' : '一般';

  return {
    dimensions,
    total_score: totalScore,
    grade,
    overall_feedback: (parsed.overall_feedback as string) || (parsed.feedback as string) || '',
  };
}

export async function POST(req: NextRequest) {
  try {
    const { artwork_id, image_url, title } = await req.json();
    if (!artwork_id || !image_url) {
      return NextResponse.json({ error: 'Missing artwork_id or image_url' }, { status: 400 });
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;

    // ---- Smart Mock Mode (no API key configured) ----
    if (!apiKey || apiKey === 'sk-dummy-key-replace-me') {
      const mock = smartMockEvaluate(title || '未命名作品');
      const { dimensions, total_score, grade, overall_feedback } = mock as {
        dimensions: Record<string, { score: number; level: string; feedback: string }>;
        total_score: number;
        grade: string;
        overall_feedback: string;
      };

      // Try to save to Supabase, but don't fail if not configured
      try {
        const supabase = await createAdminClient();
        const { error } = await supabase.from('evaluations').upsert({
          artwork_id,
          score_composition: dimensions['构图']?.score || 2,
          score_color: dimensions['色彩']?.score || 2,
          score_modeling: dimensions['造型']?.score || 2,
          score_creativity: dimensions['创意']?.score || 2,
          score_completeness: dimensions['完整性']?.score || 2,
          total_score,
          grade,
          ai_feedback: overall_feedback,
          comp_feedback: dimensions['构图']?.feedback || '',
          color_feedback: dimensions['色彩']?.feedback || '',
          modeling_feedback: dimensions['造型']?.feedback || '',
          creativity_feedback: dimensions['创意']?.feedback || '',
          completeness_feedback: dimensions['完整性']?.feedback || '',
          ai_raw_json: { dimensions, total_score, grade, overall_feedback },
          status: 'pending_review',
        });
        if (error) console.warn('Supabase save skipped:', error.message);
      } catch { /* Supabase not configured, return result anyway */ }

      return NextResponse.json({
        success: true,
        dimensions,
        total_score,
        grade,
        overall_feedback,
        mock: true,
      });
    }

    // ---- Real AI Evaluation via DashScope ----
    const prompt = buildEvaluationPrompt();

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
          messages: [
            { role: 'system', content: prompt },
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: image_url } },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('DashScope error:', err);
      return NextResponse.json({ error: `AI服务调用失败: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const parsed = parseAIResponse(content);

    if (!parsed) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({ error: 'AI返回格式解析失败' }, { status: 500 });
    }

    const result = normalizeEvaluation(parsed);
    const { dimensions, total_score, grade, overall_feedback } = result as {
      dimensions: Record<string, { score: number; level: string; feedback: string }>;
      total_score: number;
      grade: string;
      overall_feedback: string;
    };

    // Try to save to Supabase, but don't fail if not configured
    try {
      const supabase = await createAdminClient();
      const { error } = await supabase.from('evaluations').upsert({
        artwork_id,
        score_composition: dimensions['构图']?.score || 2,
        score_color: dimensions['色彩']?.score || 2,
        score_modeling: dimensions['造型']?.score || 2,
        score_creativity: dimensions['创意']?.score || 2,
        score_completeness: dimensions['完整性']?.score || 2,
        total_score,
        grade,
        ai_feedback: overall_feedback,
        comp_feedback: dimensions['构图']?.feedback || '',
        color_feedback: dimensions['色彩']?.feedback || '',
        modeling_feedback: dimensions['造型']?.feedback || '',
        creativity_feedback: dimensions['创意']?.feedback || '',
        completeness_feedback: dimensions['完整性']?.feedback || '',
        ai_raw_json: result,
        status: 'pending_review',
      });
      if (error) console.warn('Supabase save skipped:', error.message);
    } catch { /* Supabase not configured */ }

    return NextResponse.json({
      success: true,
      dimensions,
      total_score,
      grade,
      overall_feedback,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Evaluate error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
