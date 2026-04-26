import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBreakdownChart } from '@/components/charts/score-breakdown';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Users, BookOpen, Star, ThumbsUp } from 'lucide-react';
import { scoreToLetter } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DEMO_PENDING = [
  {
    id: '1',
    title: '夕阳下的校园',
    student: { full_name: '王小明', school_name: '华东师范大学附小', class_name: '三年级2班' },
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    course_name: '水彩画',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    evaluations: { total_score: 13, score_composition: 2.5, score_color: 3, score_modeling: 2.8, score_creativity: 3.2, score_completeness: 2, grade: '优秀', ai_feedback: '画面色彩温馨，构图较为均衡，造型能力有待提高。', status: 'pending_review' },
  },
  {
    id: '2',
    title: '未来的家',
    student: { full_name: '李思琪', school_name: '华东师范大学附小', class_name: '四年级1班' },
    image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop',
    course_name: '素描',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    evaluations: { total_score: 12, score_composition: 3, score_color: 2.5, score_modeling: 2, score_creativity: 3.5, score_completeness: 2.5, grade: '良好', ai_feedback: '创意新颖，想象力丰富，但造型基础需要加强。', status: 'pending_review' },
  },
  {
    id: '3',
    title: '海底两万里',
    student: { full_name: '张天宇', school_name: '上海市第三小学', class_name: '二年级3班' },
    image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    course_name: '儿童画',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    evaluations: { total_score: 10, score_composition: 2, score_color: 3.5, score_modeling: 2, score_creativity: 3, score_completeness: 1.5, grade: '良好', ai_feedback: '色彩运用大胆活泼，构图略显分散，建议注意主体突出。', status: 'pending_review' },
  },
];

const DEMO_APPROVED = [
  { id: '4', title: '我的小花园', student: { full_name: '张小明' }, image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop', created_at: new Date(Date.now() - 345600000).toISOString(), evaluations: { total_score: 14, grade: '杰出' } },
  { id: '5', title: '森林里的精灵', student: { full_name: '陈小华' }, image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop', created_at: new Date(Date.now() - 432000000).toISOString(), evaluations: { total_score: 13, grade: '优秀' } },
  { id: '6', title: '春天的颜色', student: { full_name: '刘小美' }, image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop', created_at: new Date(Date.now() - 518400000).toISOString(), evaluations: { total_score: 12, grade: '优秀' } },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function TeacherPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let pendingArtworks = DEMO_PENDING;
  let approvedArtworks = DEMO_APPROVED;

  if (user) {
    const { data: arts } = await supabase
      .from('artworks')
      .select('*, evaluations(*), profiles(full_name, school_name, class_name)')
      .order('created_at', { ascending: false });
    if (arts) {
      pendingArtworks = arts.filter(a => a.evaluations?.status === 'pending_review');
      approvedArtworks = arts.filter(a => a.evaluations?.status === 'approved').slice(0, 3);
    }
  }

  const totalArtworks = pendingArtworks.length + approvedArtworks.length;
  const passRate = totalArtworks > 0 ? Math.round((approvedArtworks.length / totalArtworks) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
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
        {/* Demo Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">当前为演示模式</span>
          </div>
          <span className="text-sm text-blue-600">登录后管理真实学生作品</span>
        </div>

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">批阅工作台</h1>
          <p className="text-gray-500 mt-1">审核学生作品，确保持公正的评价</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '待批阅', value: pendingArtworks.length, icon: <Clock className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50 border-amber-200' },
            { label: '已通过', value: approvedArtworks.length, icon: <ThumbsUp className="w-5 h-5 text-green-600" />, color: 'bg-green-50 border-green-200' },
            { label: '总计作品', value: totalArtworks, icon: <BookOpen className="w-5 h-5 text-blue-600" />, color: 'bg-blue-50 border-blue-200' },
            { label: '通过率', value: `${passRate}%`, icon: <Star className="w-5 h-5 text-purple-600" />, color: 'bg-purple-50 border-purple-200' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-xl border p-4 ${stat.color}`}>
              <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Review */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              待批阅 ({pendingArtworks.length})
            </h2>
            <div className="space-y-4">
              {pendingArtworks.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden">
                  <div className="grid md:grid-cols-5 gap-4 p-4">
                    <div className="md:col-span-2">
                      <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                        <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{artwork.title}</h3>
                          <p className="text-sm text-gray-500">
                            {artwork.student.full_name} · {artwork.student.school_name} · {artwork.student.class_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">提交时间: {formatDate(artwork.created_at)}</p>
                          {artwork.course_name && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{artwork.course_name}</span>
                          )}
                        </div>
                      </div>

                      {artwork.evaluations && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">AI 初评结果</h4>
                          <div className="grid grid-cols-5 gap-2 mb-3">
                            {[
                              { label: '构图', score: artwork.evaluations.score_composition },
                              { label: '色彩', score: artwork.evaluations.score_color },
                              { label: '造型', score: artwork.evaluations.score_modeling },
                              { label: '创意', score: artwork.evaluations.score_creativity },
                              { label: '完整性', score: artwork.evaluations.score_completeness },
                            ].map((dim) => (
                              <div key={dim.label} className="text-center">
                                <p className="text-xs text-gray-500 mb-1">{dim.label}</p>
                                <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                                  dim.score >= 3 ? 'bg-green-100 text-green-700' : dim.score >= 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                }`}>{scoreToLetter(dim.score)}</span>
                                <p className="text-xs text-gray-400 mt-0.5">{dim.score}分</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-lg font-bold text-purple-600">总分{artwork.evaluations.total_score}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              artwork.evaluations.grade === '杰出' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                            }`}>{artwork.evaluations.grade}</span>
                          </div>
                          {artwork.evaluations.ai_feedback && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium text-gray-700">AI 评语：</span>
                                {artwork.evaluations.ai_feedback}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1">
                              <CheckCircle className="w-4 h-4" /> 通过审核
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <XCircle className="w-4 h-4" /> 驳回修改
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              修改评分
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Score Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">评分分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreBreakdownChart data={[
                  { dimension: '构图', score: 2.5, letter: 'B+' },
                  { dimension: '色彩', score: 2.8, letter: 'A-' },
                  { dimension: '造型', score: 2.2, letter: 'B' },
                  { dimension: '创意', score: 2.9, letter: 'A-' },
                  { dimension: '完整性', score: 2.0, letter: 'B' },
                ]} />
              </CardContent>
            </Card>

            {/* Recently Approved */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                最近已通过
              </h3>
              <div className="space-y-3">
                {approvedArtworks.map((artwork) => (
                  <Card key={artwork.id}>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
