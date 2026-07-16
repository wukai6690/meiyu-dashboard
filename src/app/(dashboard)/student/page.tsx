import { getLevelInfo, scoreToLetter } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart } from '@/components/charts/radar-chart';
import { GrowthChart } from '@/components/charts/growth-chart';
import { BookOpen, Star, TrendingUp, Award, Image, ChevronRight, Sparkles, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { LocalStudentPanel } from '@/components/local-data-provider';

export const dynamic = 'force-dynamic';

// Fallback data shown when Supabase is unavailable
const FALLBACK = {
  profile: { id: 'demo', full_name: '张小明', exp: 320, artworks_count: 8, avg_score: 13.5 },
  recentArtworks: [
    { id: '1', title: '夕阳下的校园', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', total_score: 14, grade: '杰出', created_at: new Date(Date.now() - 86400000).toISOString(), evaluations: { ai_feedback: '构图均衡有层次，色彩运用成熟温暖。' } },
    { id: '2', title: '我的小花园', image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop', total_score: 12, grade: '优秀', created_at: new Date(Date.now() - 172800000).toISOString(), evaluations: { ai_feedback: '色彩明快活泼，创意表达有个性。' } },
    { id: '3', title: '海底世界', image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', total_score: 13, grade: '优秀', created_at: new Date(Date.now() - 259200000).toISOString(), evaluations: { ai_feedback: '想象力非常丰富！色彩运用大胆。' } },
  ],
  radarData: [
    { dimension: '构图', score: 2.8 }, { dimension: '色彩', score: 3 },
    { dimension: '造型', score: 2.5 }, { dimension: '创意', score: 2.7 }, { dimension: '完整性', score: 2.5 },
  ],
  growthData: [
    { date: '1月', exp: 0, score: 0 }, { date: '2月', exp: 20, score: 10 },
    { date: '3月', exp: 60, score: 11 }, { date: '4月', exp: 120, score: 12 },
    { date: '5月', exp: 200, score: 13 }, { date: '6月', exp: 320, score: 13.5 },
  ],
  badges: [
    { id: '1', name: '初露锋芒', icon: '⭐' }, { id: '2', name: '创意之星', icon: '🌟' },
    { id: '3', name: '调色盘大师', icon: '🎨' }, { id: '4', name: '完美主义者', icon: '💎' },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeRadarFromEvals(evaluations: any[]) {
  const dims = ['score_composition', 'score_color', 'score_modeling', 'score_creativity', 'score_completeness'];
  const labels = ['构图', '色彩', '造型', '创意', '完整性'];
  if (!evaluations.length) return FALLBACK.radarData;
  return labels.map((label, i) => ({
    dimension: label,
    score: Math.round((evaluations.reduce((s, e) => s + (Number(e[dims[i]]) || 2), 0) / evaluations.length) * 10) / 10,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeGrowth(artworks: any[]) {
  if (!artworks.length) return FALLBACK.growthData;
  const sorted = [...artworks]
    .filter((a) => a.created_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  if (!sorted.length) return FALLBACK.growthData;

  let cumulativeExp = 0;
  return sorted.map((a, i) => {
    const score = a.evaluations?.total_score || a.total_score || 0;
    cumulativeExp += score >= 14 ? 50 : score >= 12 ? 30 : 20;
    return {
      date: new Date(a.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      exp: cumulativeExp,
      score,
    };
  });
}

export default async function StudentPage() {
  let isDemo = true;
  let profile: Record<string, unknown> = FALLBACK.profile;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentArtworks: any[] = FALLBACK.recentArtworks;
  let radarData = FALLBACK.radarData;
  let growthData = FALLBACK.growthData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let badges: any[] = FALLBACK.badges;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pendingArtworks: any[] = [];
  let fetchError: string | null = null;

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (user) {
      isDemo = false;

      // Profile
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) {
        // Compute exp from student_exp table
        const { data: expRecords } = await supabase.from('student_exp').select('exp_amount').eq('student_id', user.id);
        const exp = (expRecords || []).reduce((s: number, e: { exp_amount: number }) => s + e.exp_amount, 0);

        const { count: artworkCount } = await supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('student_id', user.id);

        const { data: evalScores } = await supabase
          .from('evaluations')
          .select('total_score')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(20);

        const avgScore = evalScores?.length
          ? Math.round((evalScores.reduce((s: number, e: { total_score: number }) => s + e.total_score, 0) / evalScores.length) * 10) / 10
          : 0;

        profile = { ...p, exp, artworks_count: artworkCount || 0, avg_score: avgScore };
      }

      // Artworks
      const { data: arts, error: artsError } = await supabase
        .from('artworks')
        .select('id, title, image_url, total_score:evaluations(total_score), grade:evaluations(grade), ai_feedback:evaluations(ai_feedback), status:evaluations(status), created_at, evaluations!inner(*)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8);

      if (artsError) {
        fetchError = artsError.message;
      } else if (arts?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allEvals = arts.map((a: any) => a.evaluations).filter(Boolean);
        recentArtworks = arts.slice(0, 3);
        pendingArtworks = arts.filter((a: any) => a.evaluations?.status === 'pending_review');
        radarData = computeRadarFromEvals(allEvals);
        growthData = computeGrowth(arts);
      }

      // Badges
      try {
        const { data: badgeData } = await supabase
          .from('student_badges')
          .select('badges(name, icon)')
          .eq('student_id', user.id);
        if (badgeData?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          badges = badgeData.map((b: any) => ({
            id: b.badges?.name || '',
            name: b.badges?.name || '',
            icon: b.badges?.icon || '🏅',
          }));
        }
      } catch { /* badges optional */ }
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : '数据库连接失败';
  }

  const levelInfo = getLevelInfo((profile.exp as number) || 0);
  const level = levelInfo.level;
  const progress = Math.round((levelInfo.currentExp / levelInfo.nextExp) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" /><div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px]" /></div>

      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div><span className="font-bold text-white">美育观止</span><span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">学生端</span></Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-sm font-medium hover:from-purple-500 transition-all shadow-lg shadow-purple-500/20"><Sparkles className="w-3 h-3" />AI评价演示</Link>
            <Link href="/teacher"><span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">教师端</span></Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6"><h1 className="text-2xl font-bold">我的美育成长档案</h1><p className="text-gray-500 mt-1">记录每一次创作，见证每一步成长</p></div>

        {fetchError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 text-sm font-medium">数据库连接失败</p>
              <p className="text-amber-400/60 text-xs mt-1">显示示例数据。请确认 Supabase 已配置。</p>
            </div>
          </div>
        )}

        {/* LocalStorage data (when no Supabase) */}
        <LocalStudentPanel />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 stagger-children">
              {[
                { label: '等级', value: `Lv.${level}`, icon: <Star className="w-5 h-5 text-purple-400" />, sub: `${levelInfo.currentExp} EXP` },
                { label: '作品', value: `${profile.artworks_count || recentArtworks.length}`, icon: <Image className="w-5 h-5 text-blue-400" />, sub: '幅' },
                { label: '评价', value: `${recentArtworks.length + pendingArtworks.length}`, icon: <BookOpen className="w-5 h-5 text-emerald-400" />, sub: '次' },
                { label: '均分', value: `${((profile.avg_score as number) || 0).toFixed(1)}`, icon: <TrendingUp className="w-5 h-5 text-amber-400" />, sub: '分' },
              ].map((s, i) => (
                <Card key={i} className="bg-white/5 border-white/10"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2">{s.icon}</div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label} · {s.sub}</p></CardContent></Card>
              ))}
            </div>

            {/* Radar */}
            <Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="flex items-center gap-2 text-gray-200"><Award className="w-5 h-5 text-purple-400" />最近作品五维分析</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-2 gap-6"><RadarChart data={radarData} /><div className="flex flex-col justify-center gap-2">{radarData.map((d) => (<div key={d.dimension} className="flex items-center justify-between"><span className="text-sm text-gray-300">{d.dimension}</span><div className="flex items-center gap-2"><div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${(d.score / 3) * 100}%` }} /></div><span className="text-sm font-bold text-purple-400">{scoreToLetter(d.score)}</span></div></div>))}</div></div></CardContent></Card>

            {/* Growth */}
            <Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="flex items-center gap-2 text-gray-200"><TrendingUp className="w-5 h-5 text-indigo-400" />成长轨迹</CardTitle></CardHeader><CardContent><GrowthChart data={growthData} /></CardContent></Card>

            {/* Recent artworks */}
            <div><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">最近作品</h2><Link href="/student" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">查看全部 <ChevronRight className="w-4 h-4" /></Link></div><div className="grid md:grid-cols-3 gap-4">{recentArtworks.map((artwork: Record<string, unknown>) => (<Link key={artwork.id as string} href={`/evaluation/${artwork.id}`}><Card className="overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-xl transition-all cursor-pointer h-full"><div className="aspect-[4/3] bg-gray-800 overflow-hidden"><img src={artwork.image_url as string} alt={artwork.title as string} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div><CardContent className="p-3"><h3 className="font-medium text-sm mb-1 text-white">{artwork.title as string}</h3><div className="flex items-center justify-between"><span className={`text-xs px-2 py-0.5 rounded-full ${artwork.grade === '杰出' ? 'bg-purple-500/20 text-purple-400' : artwork.grade === '优秀' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-400'}`}>{artwork.grade as string}</span><span className="text-xs text-gray-500">{artwork.total_score as number}分</span></div><p className="text-xs text-purple-400 mt-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3" />查看详细评价</p></CardContent></Card></Link>))}</div></div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Card */}
            <Card className="bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border-purple-500/30 backdrop-blur-sm"><CardContent className="p-6"><div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><Star className="w-6 h-6 text-white" /></div><div><p className="text-purple-200 text-sm">当前等级</p><p className="text-3xl font-bold text-white">Lv.{level}</p></div></div><div><div className="flex justify-between text-sm mb-1"><span className="text-purple-200">{levelInfo.currentExp} EXP</span><span className="text-purple-300/60">{levelInfo.nextExp} EXP →</span></div><div className="h-3 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} /></div></div></CardContent></Card>

            {/* Pending review */}
            <Card className="bg-white/5 border-white/10"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-300 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" />待审核</CardTitle></CardHeader><CardContent>
              {pendingArtworks.length > 0 ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {pendingArtworks.map((a: any) => (
                    <Link key={a.id} href={`/evaluation/${a.id}`}>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-10 h-8 rounded overflow-hidden flex-shrink-0"><img src={a.image_url} alt={a.title} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 min-w-0"><p className="text-xs text-gray-300 truncate">{a.title}</p></div>
                        <span className="text-xs px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full">审核中</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">暂无待审核作品</p>
              )}
            </CardContent></Card>

            {/* Badges */}
            <Card className="bg-white/5 border-white/10"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-300">徽章</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-3">{badges.map((b) => (<div key={b.id} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 hover:bg-purple-500/10 transition-colors cursor-pointer"><span className="text-2xl mb-1">{b.icon}</span><span className="text-xs text-gray-300">{b.name}</span></div>))}</div></CardContent></Card>
          </div>
        </div>
      </main>
    </div>
  );
}
