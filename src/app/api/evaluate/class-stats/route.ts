import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get all evaluated artworks
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select('*')
      .not('total_score', 'is', null)
      .order('created_at', { ascending: false });

    if (!evaluations || evaluations.length === 0) {
      return NextResponse.json({
        total_count: 0,
        avg_scores: [],
        grade_distribution: [],
        common_strengths: [],
        common_weaknesses: [],
        teaching_advice: '暂无评价数据',
      });
    }

    const count = evaluations.length;

    // Average dimension scores
    const avgComp = evaluations.reduce((s, e) => s + e.score_composition, 0) / count;
    const avgColor = evaluations.reduce((s, e) => s + e.score_color, 0) / count;
    const avgModel = evaluations.reduce((s, e) => s + e.score_modeling, 0) / count;
    const avgCreat = evaluations.reduce((s, e) => s + e.score_creativity, 0) / count;
    const avgCompl = evaluations.reduce((s, e) => s + e.score_completeness, 0) / count;

    const avgScores = [
      { dimension: '构图', score: +avgComp.toFixed(1) },
      { dimension: '色彩', score: +avgColor.toFixed(1) },
      { dimension: '造型', score: +avgModel.toFixed(1) },
      { dimension: '创意', score: +avgCreat.toFixed(1) },
      { dimension: '完整性', score: +avgCompl.toFixed(1) },
    ];

    // Grade distribution
    const gradeCounts: Record<string, number> = { '杰出': 0, '优秀': 0, '良好': 0, '一般': 0 };
    evaluations.forEach((e) => {
      if (gradeCounts[e.grade] !== undefined) gradeCounts[e.grade]++;
    });
    const gradeDistribution = Object.entries(gradeCounts).map(([grade, n]) => ({ grade, count: n }));

    // Identify common strengths (dimensions where avg > 2.3) and weaknesses (avg < 1.8)
    const threshold = 2.3;
    const weakThreshold = 1.8;
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const dimAvgs = [
      { name: '构图', avg: avgComp },
      { name: '色彩', avg: avgColor },
      { name: '造型', avg: avgModel },
      { name: '创意', avg: avgCreat },
      { name: '完整性', avg: avgCompl },
    ];

    dimAvgs.forEach((d) => {
      if (d.avg >= threshold) strengths.push(d.name);
      if (d.avg <= weakThreshold) weaknesses.push(d.name);
    });

    // Generate teaching advice
    let advice = '';
    if (strengths.length > 0) {
      advice += `班级在${strengths.join('、')}维度表现较好，建议继续保持并引导学有余力的学生进一步提升。`;
    }
    if (weaknesses.length > 0) {
      advice += `班级在${weaknesses.join('、')}维度整体偏弱，建议在后续教学中增加专项训练，并可利用AI评价系统的维度追踪功能持续观察改善情况。`;
    }
    if (strengths.length === 0 && weaknesses.length === 0) {
      advice = '班级各维度表现较为均衡，建议根据每个学生的特点进行差异化指导，注重发挥个人优势维度。';
    }

    return NextResponse.json({
      total_count: count,
      avg_scores: avgScores,
      grade_distribution: gradeDistribution,
      common_strengths: strengths,
      common_weaknesses: weaknesses,
      teaching_advice: advice,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
