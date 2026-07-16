import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart } from '@/components/charts/radar-chart';
import { CheckCircle, XCircle, Clock, Users, BookOpen, Star, ThumbsUp, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { scoreToLetter, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { TeacherReviewButtons } from './review-buttons';
import { LocalTeacherPanel } from '@/components/local-data-provider';

export const dynamic = 'force-dynamic';

const DIM_COLORS: Record<string, string> = { '构图': 'border-purple-500/30', '色彩': 'border-amber-500/30', '造型': 'border-emerald-500/30', '创意': 'border-rose-500/30', '完整性': 'border-blue-500/30' };
const DIM_KEYS = ['composition', 'color', 'modeling', 'creativity', 'completeness'] as const;
const DIM_LABELS: Record<string, string> = { composition: '构图', color: '色彩', modeling: '造型', creativity: '创意', completeness: '完整性' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeClassStats(artworks: any[]) {
  const evaled = artworks.filter((a) => a.evaluations);
  if (evaled.length === 0) {
    return {
      avg_scores: DIM_KEYS.map((k) => ({ dimension: DIM_LABELS[k], score: 0 })),
      grade_distribution: [],
      common_strengths: [],
      common_weaknesses: [],
      teaching_advice: '暂无评价数据，上传学生作品并完成AI评价后将自动生成分析。',
      total_count: 0,
    };
  }

  // Average scores per dimension
  const dimScores: Record<string, number[]> = {};
  DIM_KEYS.forEach((k) => { dimScores[DIM_LABELS[k]] = []; });
  const gradeCounts: Record<string, number> = {};

  for (const a of evaled) {
    const e = a.evaluations;
    dimScores['构图'].push(e.score_composition);
    dimScores['色彩'].push(e.score_color);
    dimScores['造型'].push(e.score_modeling);
    dimScores['创意'].push(e.score_creativity);
    dimScores['完整性'].push(e.score_completeness);
    gradeCounts[e.grade] = (gradeCounts[e.grade] || 0) + 1;
  }

  const avg_scores = DIM_KEYS.map((k) => ({
    dimension: DIM_LABELS[k],
    score: Math.round((dimScores[DIM_LABELS[k]].reduce((a, b) => a + b, 0) / dimScores[DIM_LABELS[k]].length) * 10) / 10,
  }));

  const topDims = DIM_KEYS.map((k) => DIM_LABELS[k]).sort((a, b) => {
    const sa = dimScores[a].reduce((x, y) => x + y, 0) / dimScores[a].length;
    const sb = dimScores[b].reduce((x, y) => x + y, 0) / dimScores[b].length;
    return sb - sa;
  });

  const common_strengths = topDims.slice(0, 2);
  const common_weaknesses = topDims.slice(-2).reverse();

  const grade_distribution = Object.entries(gradeCounts)
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => b.count - a.count);

  const teaching_advice = `${common_strengths[0]}、${common_strengths[1]}表现较好。${common_weaknesses[0]}维度整体偏弱，建议增加针对性训练，利用AI追踪功能持续观察改善。`;

  return { avg_scores, grade_distribution, common_strengths, common_weaknesses, teaching_advice, total_count: evaled.length };
}

export default async function TeacherPage() {
  let pendingArtworks: unknown[] = [];
  let approvedArtworks: unknown[] = [];
  let classStats = computeClassStats([]);
  let fetchError: string | null = null;

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Fetch all artworks with evaluations and student profiles
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, image_url, course_name, created_at, student_id, profiles!artworks_student_id_fkey(full_name, school_name, class_name), evaluations(*)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      fetchError = error.message;
    } else if (artworks) {
      pendingArtworks = artworks.filter((a) => a.evaluations?.[0]?.status === 'pending_review');
      approvedArtworks = artworks.filter((a) => a.evaluations?.[0]?.status === 'approved');
      classStats = computeClassStats(artworks);
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : '数据库连接失败';
  }

  const totalArtworks = pendingArtworks.length + approvedArtworks.length;
  const passRate = totalArtworks > 0 ? Math.round((approvedArtworks.length / totalArtworks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" /><div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px]" /></div>

      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div><span className="font-bold text-white">美育观止</span><span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">教师端</span></Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-sm font-medium hover:from-purple-500 transition-all"><Sparkles className="w-3 h-3" />AI评价演示</Link>
            <Link href="/"><span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">退出</span></Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6"><h1 className="text-2xl font-bold">批阅工作台</h1><p className="text-gray-500 mt-1">AI初评 + 教师复审 = 高效精准的美育评价</p></div>

        {/* Database error banner */}
        {fetchError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 text-sm font-medium">数据库连接失败</p>
              <p className="text-amber-400/60 text-xs mt-1">{fetchError}</p>
              <p className="text-amber-400/40 text-xs mt-2">请确认 Supabase 环境变量已正确配置，或联系管理员。下方显示的是示例数据。</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8 stagger-children">
          {[
            { label: '待批阅', value: pendingArtworks.length, icon: <Clock className="w-5 h-5 text-amber-400" /> },
            { label: '已通过', value: approvedArtworks.length, icon: <ThumbsUp className="w-5 h-5 text-emerald-400" /> },
            { label: '总数', value: classStats.total_count, icon: <BookOpen className="w-5 h-5 text-blue-400" /> },
            { label: '通过率', value: `${passRate}%`, icon: <Star className="w-5 h-5 text-purple-400" /> },
          ].map((s, i) => (
            <Card key={i} className="bg-white/5 border-white/10"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2">{s.icon}</div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></CardContent></Card>
          ))}
        </div>

        {/* Class Analytics */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" />班级学情总览</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="text-sm text-gray-300">维度均值</CardTitle></CardHeader><CardContent><RadarChart data={classStats.avg_scores} /></CardContent></Card>
          <Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="text-sm text-gray-300">教学诊断</CardTitle></CardHeader><CardContent className="space-y-4">
            <div><h4 className="text-xs font-medium text-emerald-400 mb-2">优势维度</h4><div className="flex gap-2">{classStats.common_strengths.length > 0 ? classStats.common_strengths.map((d: string) => (<span key={d} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">{d}</span>)) : <span className="text-xs text-gray-500">暂无数据</span>}</div></div>
            <div><h4 className="text-xs font-medium text-amber-400 mb-2">需加强</h4><div className="flex gap-2">{classStats.common_weaknesses.length > 0 ? classStats.common_weaknesses.map((d: string) => (<span key={d} className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">{d}</span>)) : <span className="text-xs text-gray-500">暂无数据</span>}</div></div>
            <div className="bg-indigo-500/10 rounded-xl p-3"><p className="text-xs text-indigo-300 leading-relaxed">{classStats.teaching_advice}</p></div>
          </CardContent></Card>
          <Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="text-sm text-gray-300">评级分布</CardTitle></CardHeader><CardContent className="space-y-3">
            {classStats.grade_distribution.length > 0 ? classStats.grade_distribution.map((g: { grade: string; count: number }) => {
              const pct = classStats.total_count > 0 ? Math.round((g.count / classStats.total_count) * 100) : 0;
              const colors: Record<string, string> = { '杰出': 'bg-purple-500', '优秀': 'bg-emerald-500', '良好': 'bg-amber-500', '一般': 'bg-gray-500' };
              return (<div key={g.grade} className="flex items-center gap-3"><span className="text-sm w-10 text-gray-300">{g.grade}</span><div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${colors[g.grade] || 'bg-gray-500'} rounded-full flex items-center justify-end pr-2`} style={{ width: `${Math.max(pct, 5)}%` }}><span className="text-xs text-white font-medium">{g.count}人</span></div></div></div>);
            }) : <p className="text-sm text-gray-500 text-center py-8">暂无评价记录</p>}
          </CardContent></Card>
        </div>

        {/* LocalStorage fallback data */}
        <LocalTeacherPanel />

        {/* Empty state */}
        {pendingArtworks.length === 0 && approvedArtworks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">尚无学生作品</h3>
            <p className="text-sm text-gray-600 mb-4">学生通过 Demo 页面上传作品后，AI 会自动评价并展示在这里</p>
            <Link href="/demo" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-xl text-sm hover:bg-purple-600/30 transition-colors">
              <Sparkles className="w-4 h-4" />去体验 AI 评价
            </Link>
          </div>
        )}

        {/* Pending Review */}
        {pendingArtworks.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-400" />待批阅 ({pendingArtworks.length})</h2>
            <div className="space-y-4 mb-8">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {pendingArtworks.map((a: any) => {
                const ev = a.evaluations;
                const profile = a.profiles;
                return (
                  <Card key={a.id} className="bg-white/5 border-white/10 overflow-hidden">
                    <div className="grid md:grid-cols-5 gap-4 p-4">
                      <div className="md:col-span-2">
                        <Link href={`/evaluation/${a.id}`}>
                          <div className="aspect-[4/3] rounded-xl overflow-hidden hover:ring-2 ring-purple-500/50 transition-all">
                            <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                          </div>
                        </Link>
                      </div>
                      <div className="md:col-span-3">
                        <div className="mb-2">
                          <Link href={`/evaluation/${a.id}`} className="hover:text-purple-400 transition-colors">
                            <h3 className="font-semibold text-lg">{a.title}</h3>
                          </Link>
                          <p className="text-sm text-gray-500">
                            {profile?.full_name || '未知学生'} · {profile?.school_name || '未知学校'} · {profile?.class_name || ''}
                            {a.course_name && <span className="ml-2 text-gray-600">· {a.course_name}</span>}
                          </p>
                        </div>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          {[
                            { label: '构图', score: ev.score_composition },
                            { label: '色彩', score: ev.score_color },
                            { label: '造型', score: ev.score_modeling },
                            { label: '创意', score: ev.score_creativity },
                            { label: '完整性', score: ev.score_completeness },
                          ].map((d) => (
                            <div key={d.label} className={`text-center p-2 rounded-lg border ${DIM_COLORS[d.label] || 'border-white/10'} bg-white/5`}>
                              <p className="text-xs text-gray-500 mb-0.5">{d.label}</p>
                              <span className={`inline-block px-1.5 py-0.5 text-xs font-bold rounded ${d.score >= 3 ? 'bg-emerald-500/20 text-emerald-400' : d.score >= 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>{scoreToLetter(d.score)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-bold text-purple-400">总分{ev.total_score}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${ev.grade === '杰出' ? 'bg-purple-500/20 text-purple-400' : ev.grade === '优秀' ? 'bg-emerald-500/20 text-emerald-400' : ev.grade === '良好' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>{ev.grade}</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                          <p className="text-sm text-gray-400 line-clamp-2">{ev.ai_feedback || ev.overall_feedback || '暂无评价'}</p>
                        </div>
                        <div className="flex gap-2">
                          <TeacherReviewButtons artworkId={a.id} />
                          <Link href={`/evaluation/${a.id}`}>
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer">详情 <ArrowRight className="w-3 h-3" /></span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Approved */}
        {approvedArtworks.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-emerald-400" />已通过</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {approvedArtworks.map((a: any) => (
                <Link key={a.id} href={`/evaluation/${a.id}`}>
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <CardContent className="p-3 flex gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0"><img src={a.image_url} alt={a.title} className="w-full h-full object-cover" /></div>
                      <div>
                        <p className="text-sm font-medium truncate text-white">{a.title}</p>
                        <p className="text-xs text-gray-500">{a.profiles?.full_name || '未知'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-purple-400">{a.evaluations?.total_score || '-'}分</span>
                          <span className="text-xs px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">{a.evaluations?.grade || '-'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
