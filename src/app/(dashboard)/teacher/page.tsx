import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBreakdownChart } from '@/components/charts/score-breakdown';
import { RadarChart } from '@/components/charts/radar-chart';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Users, BookOpen, Star, ThumbsUp, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import { scoreToLetter } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const DEMO_PENDING = [
  {
    id: '1', title: '夕阳下的校园',
    student: { full_name: '王小明', school_name: '华东师范大学附小', class_name: '三年级2班' },
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    course_name: '水彩画',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    evaluations: {
      total_score: 14, score_composition: 3, score_color: 3, score_modeling: 3, score_creativity: 3, score_completeness: 2, grade: '杰出',
      ai_feedback: '这幅作品展现了出色的艺术感知力和表现技巧！构图均衡有层次，色彩运用成熟温暖，画面整体感染力很强。',
      comp_feedback: '主体突出布局饱满，空间层次处理得当！',
      color_feedback: '色调和谐优美，色彩情感表达很到位！',
      modeling_feedback: '形态捕捉生动准确，线条流畅有表现力！',
      creativity_feedback: '创意独特视角新颖，画面叙事感很强！',
      completeness_feedback: '大部分区域处理得很好，注意画面四角的收尾',
      status: 'pending_review',
    },
  },
  {
    id: '2', title: '未来的家',
    student: { full_name: '李思琪', school_name: '华东师范大学附小', class_name: '四年级1班' },
    image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop',
    course_name: '素描',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    evaluations: {
      total_score: 12, score_composition: 2, score_color: 3, score_modeling: 2, score_creativity: 3, score_completeness: 2, grade: '优秀',
      ai_feedback: '创意新颖独特，想象力非常丰富！色彩运用有想法，但在造型基础和构图完整性上还有提升空间。',
      comp_feedback: '主体位置基本合理，可以尝试更有张力的构图',
      color_feedback: '冷暖搭配恰到好处，涂色细腻均匀',
      modeling_feedback: '造型基本准确，可以加强一些细节的刻画',
      creativity_feedback: '题材立意新颖独特，有强烈的个人视角和情感表达',
      completeness_feedback: '主体部分完成得不错，背景也可以再丰富一些',
      status: 'pending_review',
    },
  },
  {
    id: '3', title: '海底两万里',
    student: { full_name: '张天宇', school_name: '上海市第三小学', class_name: '二年级3班' },
    image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    course_name: '儿童画',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    evaluations: {
      total_score: 10, score_composition: 2, score_color: 3, score_modeling: 1, score_creativity: 2, score_completeness: 2, grade: '良好',
      ai_feedback: '色彩运用大胆活泼，是这幅画最大的亮点！构图略显分散，造型基础还需要加强。在细节完整性上多花些功夫会更棒。',
      comp_feedback: '物体偏小分散，建议把主体放大集中',
      color_feedback: '色彩层次丰富，明暗变化处理得很好',
      modeling_feedback: '建议多观察实物轮廓，先从简单的形状开始练习',
      creativity_feedback: '想法不错，可以更大胆地展现自己的独特视角',
      completeness_feedback: '画面还有空白区域，坚持画完每一处',
      status: 'pending_review',
    },
  },
];

const DEMO_APPROVED = [
  { id: '4', title: '我的小花园', student: { full_name: '陈小华' }, image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop', created_at: new Date(Date.now() - 345600000).toISOString(), evaluations: { total_score: 14, grade: '杰出' } },
  { id: '5', title: '森林里的精灵', student: { full_name: '刘小美' }, image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop', created_at: new Date(Date.now() - 432000000).toISOString(), evaluations: { total_score: 13, grade: '优秀' } },
  { id: '6', title: '春天的颜色', student: { full_name: '张小萌' }, image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop', created_at: new Date(Date.now() - 518400000).toISOString(), evaluations: { total_score: 12, grade: '优秀' } },
];

const DEMO_CLASS_STATS = {
  avg_scores: [{ dimension: '构图', score: 2.3 }, { dimension: '色彩', score: 2.8 }, { dimension: '造型', score: 2.1 }, { dimension: '创意', score: 2.6 }, { dimension: '完整性', score: 2.0 }],
  grade_distribution: [{ grade: '杰出', count: 2 }, { grade: '优秀', count: 8 }, { grade: '良好', count: 5 }, { grade: '一般', count: 1 }],
  common_strengths: ['色彩', '创意'],
  common_weaknesses: ['完整性'],
  teaching_advice: '班级在色彩、创意维度表现较好，建议继续保持。班级在完整性维度整体偏弱，建议在后续教学中增加"先整体后局部"的作画步骤训练。',
  total_count: 16,
};

const DIM_COLORS: Record<string, string> = {
  '构图': 'border-purple-300 bg-purple-50', '色彩': 'border-amber-300 bg-amber-50', '造型': 'border-emerald-300 bg-emerald-50', '创意': 'border-rose-300 bg-rose-50', '完整性': 'border-blue-300 bg-blue-50',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function TeacherPage() {
  let pendingArtworks = DEMO_PENDING;
  let approvedArtworks = DEMO_APPROVED;
  let classStats = DEMO_CLASS_STATS;

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (user) {
      try {
        const { data: arts } = await supabase
          .from('artworks').select('*, evaluations(*), profiles(full_name, school_name, class_name)')
          .order('created_at', { ascending: false });
        if (arts) {
          pendingArtworks = arts.filter((a: Record<string, unknown>) => (a.evaluations as Record<string, unknown>)?.status === 'pending_review');
          approvedArtworks = arts.filter((a: Record<string, unknown>) => (a.evaluations as Record<string, unknown>)?.status === 'approved').slice(0, 3);
        }
      } catch { /* skip */ }

      try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/evaluate/class-stats`);
        if (resp.ok) {
          const stats = await resp.json();
          if (stats.total_count > 0) classStats = stats;
        }
      } catch { /* skip */ }
    }
  } catch { /* no Supabase, use demo */ }

  const totalArtworks = pendingArtworks.length + approvedArtworks.length;
  const passRate = totalArtworks > 0 ? Math.round((approvedArtworks.length / totalArtworks) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">美</span>
            </div>
            <span className="font-bold text-lg">美育观止</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">教师端</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <form action="/auth/signout" method="post">
              <button className="hover:text-red-500">退出</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">批阅工作台</h1>
            <p className="text-gray-500 mt-1">AI初评 + 教师复审 = 高效精准的美育评价</p>
          </div>
          <Link href="/demo" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm">
            <Sparkles className="w-4 h-4" />
            AI评价演示
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '待批阅', value: pendingArtworks.length, icon: <Clock className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50 border-amber-200' },
            { label: '已通过', value: approvedArtworks.length, icon: <ThumbsUp className="w-5 h-5 text-green-600" />, color: 'bg-green-50 border-green-200' },
            { label: '班级作品数', value: classStats.total_count, icon: <BookOpen className="w-5 h-5 text-blue-600" />, color: 'bg-blue-50 border-blue-200' },
            { label: '通过率', value: `${passRate}%`, icon: <Star className="w-5 h-5 text-purple-600" />, color: 'bg-purple-50 border-purple-200' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-xl border p-4 ${stat.color}`}>
              <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Class Analytics */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          班级学情总览
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">年级维度均值</CardTitle></CardHeader>
            <CardContent><RadarChart data={classStats.avg_scores} /></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">教学诊断</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1"><Star className="w-3 h-3" /> 班级优势维度</h4>
                <div className="flex flex-wrap gap-2">
                  {classStats.common_strengths.map((d) => (<span key={d} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">{d}</span>))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> 需加强维度</h4>
                <div className="flex flex-wrap gap-2">
                  {classStats.common_weaknesses.map((d) => (<span key={d} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">{d}</span>))}
                </div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3"><p className="text-xs text-indigo-800 leading-relaxed">{classStats.teaching_advice}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">评级分布</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classStats.grade_distribution.map((g) => {
                  const pct = classStats.total_count > 0 ? Math.round((g.count / classStats.total_count) * 100) : 0;
                  const colors: Record<string, string> = { '杰出': 'bg-purple-600', '优秀': 'bg-green-500', '良好': 'bg-amber-500', '一般': 'bg-gray-400' };
                  return (
                    <div key={g.grade} className="flex items-center gap-3">
                      <span className="text-sm w-10 font-medium">{g.grade}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[g.grade]} rounded-full flex items-center justify-end pr-2`} style={{ width: `${Math.max(pct, 5)}%` }}>
                          <span className="text-xs text-white font-medium">{g.count}人</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-8">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Review */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-600" />待批阅 ({pendingArtworks.length})</h2>
          <div className="space-y-4">
            {pendingArtworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="grid md:grid-cols-5 gap-4 p-4">
                  <div className="md:col-span-2">
                    <Link href={`/evaluation/${artwork.id}`}>
                      <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden hover:ring-2 ring-purple-400 transition-all">
                        <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                      </div>
                    </Link>
                  </div>
                  <div className="md:col-span-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link href={`/evaluation/${artwork.id}`} className="hover:text-purple-600 transition-colors">
                          <h3 className="font-semibold text-lg">{artwork.title}</h3>
                        </Link>
                        <p className="text-sm text-gray-500">{artwork.student.full_name} · {artwork.student.school_name} · {artwork.student.class_name}</p>
                        <p className="text-xs text-gray-400 mt-1">提交时间: {formatDate(artwork.created_at)}</p>
                        {artwork.course_name && (<span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{artwork.course_name}</span>)}
                      </div>
                    </div>
                    {artwork.evaluations && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">AI 五维初评结果</h4>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          {[
                            { label: '构图', score: artwork.evaluations.score_composition, feedback: artwork.evaluations.comp_feedback },
                            { label: '色彩', score: artwork.evaluations.score_color, feedback: artwork.evaluations.color_feedback },
                            { label: '造型', score: artwork.evaluations.score_modeling, feedback: artwork.evaluations.modeling_feedback },
                            { label: '创意', score: artwork.evaluations.score_creativity, feedback: artwork.evaluations.creativity_feedback },
                            { label: '完整性', score: artwork.evaluations.score_completeness, feedback: artwork.evaluations.completeness_feedback },
                          ].map((dim) => (
                            <div key={dim.label} className={`text-center p-2 rounded-lg border ${DIM_COLORS[dim.label]}`}>
                              <p className="text-xs text-gray-500 mb-1">{dim.label}</p>
                              <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${dim.score >= 3 ? 'bg-green-100 text-green-700' : dim.score >= 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{scoreToLetter(dim.score)}</span>
                              <p className="text-xs text-gray-400 mt-0.5">{dim.score}分</p>
                              {dim.feedback && (<p className="text-xs text-gray-500 mt-1 line-clamp-2">{dim.feedback}</p>)}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-bold text-purple-600">总分{artwork.evaluations.total_score}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${artwork.evaluations.grade === '杰出' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{artwork.evaluations.grade}</span>
                        </div>
                        {artwork.evaluations.ai_feedback && (
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700 leading-relaxed">{artwork.evaluations.ai_feedback}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1"><CheckCircle className="w-4 h-4" /> 通过审核</Button>
                          <Button size="sm" variant="outline" className="gap-1"><XCircle className="w-4 h-4" /> 驳回修改</Button>
                          <Link href={`/evaluation/${artwork.id}`}>
                            <Button size="sm" variant="outline" className="gap-1">查看详情 <ArrowRight className="w-3 h-3" /></Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recently Approved */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-green-600" />最近已通过</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {approvedArtworks.map((artwork) => (
              <Link key={artwork.id} href={`/evaluation/${artwork.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3 flex gap-3">
                    <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{artwork.title}</p>
                      <p className="text-xs text-gray-400">{artwork.student.full_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-purple-600">{artwork.evaluations.total_score}分</span>
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">{artwork.evaluations.grade}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
