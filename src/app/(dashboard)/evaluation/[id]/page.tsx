import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart } from '@/components/charts/radar-chart';
import { ScoreBreakdownChart } from '@/components/charts/score-breakdown';
import { ArrowLeft, Award, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { scoreToLetter } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DEMO = {
  artwork: { title: '夕阳下的校园', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', course_name: '水彩画', created_at: new Date().toISOString() },
  evaluation: { total_score: 14, grade: '杰出' as const, ai_feedback: '这幅作品展现了出色的艺术感知力和表现技巧！构图均衡有层次，色彩运用成熟温暖，画面整体感染力很强。在细节完整性上稍加完善就更加完美了。继续保持这份创作热情！', comp_feedback: '主体突出布局饱满，空间层次处理得当！', color_feedback: '色调和谐优美，色彩情感表达很到位！', modeling_feedback: '形态捕捉生动准确，线条流畅有表现力！', creativity_feedback: '创意独特视角新颖，画面叙事感很强！', completeness_feedback: '大部分区域处理得很好，注意画面四角的收尾', score_composition: 3, score_color: 3, score_modeling: 3, score_creativity: 3, score_completeness: 2 },
};

export default async function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let artworkData = DEMO.artwork;
  let evalData = DEMO.evaluation;

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const { data: artwork } = await supabase.from('artworks').select('*, evaluations(*)').eq('id', id).single();
      if (artwork) { artworkData = artwork; if (artwork.evaluations) evalData = artwork.evaluations; }
    }
  } catch {}

  const dimDetails = [
    { label: '构图', score: evalData.score_composition, feedback: evalData.comp_feedback },
    { label: '色彩', score: evalData.score_color, feedback: evalData.color_feedback },
    { label: '造型', score: evalData.score_modeling, feedback: evalData.modeling_feedback },
    { label: '创意', score: evalData.score_creativity, feedback: evalData.creativity_feedback },
    { label: '完整性', score: evalData.score_completeness, feedback: evalData.completeness_feedback },
  ];

  const radarData = dimDetails.map((d) => ({ dimension: d.label, score: d.score }));
  const gradeColors: Record<string, string> = { '杰出': 'from-purple-500 to-indigo-500', '优秀': 'from-emerald-500 to-teal-500', '良好': 'from-amber-500 to-orange-500', '一般': 'from-gray-500 to-gray-600' };
  const dimBorders: Record<string, string> = { '构图': 'border-purple-500/30', '色彩': 'border-amber-500/30', '造型': 'border-emerald-500/30', '创意': 'border-rose-500/30', '完整性': 'border-blue-500/30' };
  const dimIcons: Record<string, string> = { '构图': '📐', '色彩': '🎨', '造型': '✏️', '创意': '💡', '完整性': '✅' };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" /><div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px]" /></div>

      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div><span className="font-bold">美育观止</span></Link>
          <div className="flex items-center gap-3">
            <Link href="/student"><button className="text-sm text-gray-400 hover:text-white">学生端</button></Link>
            <Link href="/teacher"><button className="text-sm text-gray-400 hover:text-white">教师端</button></Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-8">
        <Link href="/student" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"><ArrowLeft className="w-4 h-4" />返回作品列表</Link>

        <div className="grid md:grid-cols-5 gap-8 mb-10">
          <div className="md:col-span-2"><div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"><img src={artworkData.image_url} alt={artworkData.title} className="w-full h-full object-cover" /></div></div>
          <div className="md:col-span-3 flex flex-col justify-center">
            <h1 className="text-2xl font-bold mb-2">{artworkData.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className={`px-6 py-4 rounded-2xl bg-gradient-to-r ${gradeColors[evalData.grade]} shadow-xl`}><span className="text-4xl font-bold text-white">{evalData.grade}</span></div>
              <div><p className="text-3xl font-bold text-purple-400">{evalData.total_score}<span className="text-lg text-gray-500 font-normal">/15</span></p><p className="text-sm text-gray-500">综合总分</p></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm"><div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-purple-400" /><span className="text-sm font-medium text-purple-400">AI 综合评价</span></div><p className="text-gray-300 leading-relaxed">{evalData.ai_feedback}</p></div>
          </div>
        </div>

        <Card className="bg-white/5 border-white/10 mb-8"><CardHeader><CardTitle className="flex items-center gap-2 text-gray-200"><Award className="w-5 h-5 text-purple-400" />五维分析雷达图</CardTitle></CardHeader><CardContent><RadarChart data={radarData} /></CardContent></Card>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-400" />维度详细评价</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {dimDetails.map((dim) => (<Card key={dim.label} className={`border ${dimBorders[dim.label] || 'border-white/10'} bg-white/5 backdrop-blur-sm`}><CardContent className="p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><span className="text-lg">{dimIcons[dim.label]}</span><span className="font-semibold">{dim.label}</span></div><div className="flex items-center gap-2"><div className="flex gap-1">{[1, 2, 3].map((s) => (<div key={s} className={`w-3 h-6 rounded-sm ${s <= dim.score ? 'bg-purple-500' : 'bg-white/10'}`} />))}</div><span className="text-sm font-bold text-purple-400">{scoreToLetter(dim.score)}</span></div></div><p className="text-sm text-gray-400">{dim.feedback || '暂无评价'}</p></CardContent></Card>))}
        </div>

        <Card className="bg-white/5 border-white/10 mb-8"><CardHeader><CardTitle className="text-sm text-gray-300">得分对比</CardTitle></CardHeader><CardContent><ScoreBreakdownChart data={dimDetails.map((d) => ({ dimension: d.label, score: d.score, letter: scoreToLetter(d.score) }))} /></CardContent></Card>

        <div className="text-center pb-12"><Link href="/student"><button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all">返回首页</button></Link></div>
      </main>
    </div>
  );
}
