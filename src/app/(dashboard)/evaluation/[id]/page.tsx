import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart } from '@/components/charts/radar-chart';
import { ScoreBreakdownChart } from '@/components/charts/score-breakdown';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Sparkles, TrendingUp, Lightbulb, Paintbrush, Ruler, Palette, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { scoreToLetter } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DIM_ICONS: Record<string, React.ReactNode> = {
  '构图': <Ruler className="w-4 h-4" />,
  '色彩': <Palette className="w-4 h-4" />,
  '造型': <Paintbrush className="w-4 h-4" />,
  '创意': <Lightbulb className="w-4 h-4" />,
  '完整性': <CheckCircle2 className="w-4 h-4" />,
};

const DIM_COLORS: Record<string, string> = {
  '构图': 'border-purple-300 bg-purple-50',
  '色彩': 'border-amber-300 bg-amber-50',
  '造型': 'border-emerald-300 bg-emerald-50',
  '创意': 'border-rose-300 bg-rose-50',
  '完整性': 'border-blue-300 bg-blue-50',
};

const GRADE_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  '杰出': { bg: 'bg-gradient-to-r from-purple-600 to-indigo-600', text: 'text-white', icon: '🏆' },
  '优秀': { bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', text: 'text-white', icon: '⭐' },
  '良好': { bg: 'bg-gradient-to-r from-amber-400 to-orange-400', text: 'text-white', icon: '👍' },
  '一般': { bg: 'bg-gradient-to-r from-gray-400 to-gray-500', text: 'text-white', icon: '🌱' },
};

// Demo data for unauthenticated users
const DEMO_EVALUATION = {
  artwork: {
    title: '夕阳下的校园',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    created_at: new Date().toISOString(),
    course_name: '水彩画',
  },
  evaluation: {
    total_score: 13,
    grade: '优秀' as const,
    ai_feedback: '这件作品整体完成得很好！画面温馨有感染力，色彩运用和构图都有亮点。在造型细节和画面完整性上还有提升空间——这正是你下一次突破的方向。',
    comp_feedback: '主体突出布局饱满，空间层次处理得当！',
    color_feedback: '色调和谐优美，色彩情感表达很到位！',
    modeling_feedback: '造型基本准确，可以加强一些细节的刻画',
    creativity_feedback: '想法不错，可以更大胆地展现自己的独特视角',
    completeness_feedback: '大部分区域处理得很好，注意画面四角的收尾',
    score_composition: 3,
    score_color: 3,
    score_modeling: 2,
    score_creativity: 3,
    score_completeness: 2,
    ai_raw_json: null,
  },
};

export default async function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let artworkData = DEMO_EVALUATION.artwork;
  let evalData = DEMO_EVALUATION.evaluation;
  let radarData = [
    { dimension: '构图', score: 3 },
    { dimension: '色彩', score: 3 },
    { dimension: '造型', score: 2 },
    { dimension: '创意', score: 3 },
    { dimension: '完整性', score: 2 },
  ];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: artwork } = await supabase
        .from('artworks')
        .select('*, evaluations(*)')
        .eq('id', id)
        .single();

      if (artwork) {
        artworkData = artwork;
        if (artwork.evaluations) {
          evalData = artwork.evaluations;
          radarData = [
            { dimension: '构图', score: artwork.evaluations.score_composition },
            { dimension: '色彩', score: artwork.evaluations.score_color },
            { dimension: '造型', score: artwork.evaluations.score_modeling },
            { dimension: '创意', score: artwork.evaluations.score_creativity },
            { dimension: '完整性', score: artwork.evaluations.score_completeness },
          ];
        }
      }
    }
  } catch { /* Supabase not configured, show demo data */ }

  const dimDetails = [
    { label: '构图', score: evalData.score_composition, feedback: evalData.comp_feedback },
    { label: '色彩', score: evalData.score_color, feedback: evalData.color_feedback },
    { label: '造型', score: evalData.score_modeling, feedback: evalData.modeling_feedback },
    { label: '创意', score: evalData.score_creativity, feedback: evalData.creativity_feedback },
    { label: '完整性', score: evalData.score_completeness, feedback: evalData.completeness_feedback },
  ];

  const gradeStyle = GRADE_CONFIG[evalData.grade] || GRADE_CONFIG['良好'];

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Back button */}
      <Link href="/student" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        返回作品列表
      </Link>

      {/* Header - Artwork + Grade */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
            <img src={artworkData.image_url} alt={artworkData.title} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="md:col-span-3 flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-2">{artworkData.title}</h1>
          {artworkData.course_name && (
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full mb-4 w-fit">
              {artworkData.course_name}
            </span>
          )}
          <div className="flex items-center gap-4 mb-6">
            <div className={`px-6 py-4 rounded-2xl ${gradeStyle.bg} ${gradeStyle.text}`}>
              <span className="text-4xl mr-2">{gradeStyle.icon}</span>
              <span className="text-3xl font-bold">{evalData.grade}</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{evalData.total_score}<span className="text-lg text-gray-400 font-normal">/15</span></p>
              <p className="text-sm text-gray-500">综合总分</p>
            </div>
          </div>
          {/* AI Overall Feedback */}
          {evalData.ai_feedback && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">AI 综合评价</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{evalData.ai_feedback}</p>
            </div>
          )}
        </div>
      </div>

      {/* Radar Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            五维分析雷达图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadarChart data={radarData} />
        </CardContent>
      </Card>

      {/* Per-Dimension Detail */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        维度详细评价
      </h2>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {dimDetails.map((dim) => (
          <Card key={dim.label} className={`border-2 ${DIM_COLORS[dim.label] || 'border-gray-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{DIM_ICONS[dim.label]}</span>
                  <span className="font-semibold">{dim.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-3 h-6 rounded-sm ${
                          i <= dim.score
                            ? 'bg-purple-600'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-purple-600">{scoreToLetter(dim.score)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{dim.feedback || '暂无评价'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score Breakdown Bar Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">得分分布对比</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreBreakdownChart
            data={dimDetails.map((d) => ({
              dimension: d.label,
              score: d.score,
              letter: scoreToLetter(d.score),
            }))}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4 pb-8">
        <Link href="/student">
          <Button variant="outline">返回首页</Button>
        </Link>
      </div>
    </main>
  );
}
