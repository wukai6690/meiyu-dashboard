import { getLevelInfo, scoreToLetter } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart } from '@/components/charts/radar-chart';
import { GrowthChart } from '@/components/charts/growth-chart';
import { BookOpen, Star, TrendingUp, Award, Image, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const DEMO_USER = {
  id: 'demo', full_name: '张小明', role: 'student', exp: 320, level: 3,
  artworks_count: 8, avg_score: 13.5,
  levelInfo: { level: 3, currentExp: 20, nextExp: 300 },
};

const DEMO_RECENT = [
  { id: '1', title: '夕阳下的校园', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', total_score: 14, grade: '杰出', created_at: new Date(Date.now() - 86400000).toISOString(), ai_feedback: '这幅作品展现了出色的艺术感知力！构图均衡有层次，色彩运用成熟温暖，画面整体感染力很强。', comp_feedback: '主体突出布局饱满，空间层次处理得当！', color_feedback: '色调和谐优美，色彩情感表达很到位！', modeling_feedback: '形态捕捉生动准确，线条流畅有表现力！', creativity_feedback: '创意独特视角新颖，画面叙事感很强！', completeness_feedback: '画面完成度很高，每个角落都精心处理！' },
  { id: '2', title: '我的小花园', image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop', total_score: 12, grade: '优秀', created_at: new Date(Date.now() - 172800000).toISOString(), ai_feedback: '很不错的一幅作品！色彩明快活泼，创意表达有个性。如果在构图层次感上再加强一些会更好。', comp_feedback: '画面布局稳定，增加一些前景元素会让层次更丰富', color_feedback: '用色明快，适当加入对比色会让画面更有张力', modeling_feedback: '造型基本准确，可以加强一些细节的刻画', creativity_feedback: '画面有基本的叙事性，加入更多细节会让故事更生动', completeness_feedback: '主体部分完成得不错，背景也可以再丰富一些' },
  { id: '3', title: '海底世界', image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', total_score: 13, grade: '优秀', created_at: new Date(Date.now() - 259200000).toISOString(), ai_feedback: '想象力非常丰富！海底世界充满了奇思妙想。色彩运用大胆，但在造型细节上还可以再多加练习。', comp_feedback: '构图规整，试试打破对称增加动感', color_feedback: '色彩层次丰富，明暗变化处理得很好', modeling_feedback: '形态可以辨认，多观察实物会让造型更生动', creativity_feedback: '想象力丰富，表达方式很有个人风格', completeness_feedback: '整体完成度可以，再检查一下有没有遗漏的空白区域' },
];

const DEMO_RADAR = [
  { dimension: '构图', score: 2.8 }, { dimension: '色彩', score: 3 },
  { dimension: '造型', score: 2.5 }, { dimension: '创意', score: 2.7 }, { dimension: '完整性', score: 2.5 },
];

const DEMO_GROWTH = [
  { date: '1月', exp: 0, score: 0 }, { date: '2月', exp: 20, score: 10 },
  { date: '3月', exp: 60, score: 11 }, { date: '4月', exp: 120, score: 12 },
  { date: '5月', exp: 200, score: 13 }, { date: '6月', exp: 320, score: 13.5 },
];

const DEMO_BADGES = [
  { id: '1', name: '初露锋芒', icon: '⭐', description: '完成首次作品评价' },
  { id: '2', name: '创意之星', icon: '🌟', description: '连续3次创意获A级' },
  { id: '3', name: '调色盘大师', icon: '🎨', description: '连续3次色彩获A级' },
  { id: '4', name: '完美主义者', icon: '💎', description: '单幅作品五维全A' },
];

export default async function StudentPage() {
  let profile: Record<string, unknown> = { ...DEMO_USER };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentArtworks: any[] = [...DEMO_RECENT];
  let radarData = DEMO_RADAR;
  let growthData = DEMO_GROWTH;

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (user) {
      try {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (p) profile = { ...p, exp: 320, levelInfo: getLevelInfo(320) };
      } catch { /* skip */ }

      try {
        const { data: arts } = await supabase
          .from('artworks').select('*, evaluations(*)')
          .eq('student_id', user.id).order('created_at', { ascending: false }).limit(3);
        if (arts && arts.length > 0) recentArtworks = arts;
      } catch { /* skip */ }

      try {
        const { data: evals } = await supabase
          .from('evaluations')
          .select('score_composition, score_color, score_modeling, score_creativity, score_completeness')
          .eq('status', 'approved').order('created_at', { ascending: false }).limit(5);
        if (evals && evals.length > 0) {
          radarData = [
            { dimension: '构图', score: evals[0].score_composition || 2 },
            { dimension: '色彩', score: evals[0].score_color || 2 },
            { dimension: '造型', score: evals[0].score_modeling || 2 },
            { dimension: '创意', score: evals[0].score_creativity || 2 },
            { dimension: '完整性', score: evals[0].score_completeness || 2 },
          ];
        }
      } catch { /* skip */ }
    }
  } catch { /* no Supabase, use demo */ }

  const levelInfo = 'levelInfo' in profile
    ? (profile.levelInfo as { level: number; currentExp: number; nextExp: number })
    : getLevelInfo((profile.exp as number) || 0);
  const level = levelInfo.level;
  const progress = Math.round((levelInfo.currentExp / levelInfo.nextExp) * 100);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的美育成长档案</h1>
          <p className="text-gray-500 mt-1">记录每一次创作，见证每一步成长</p>
        </div>
        <Link href="/demo" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm">
          <Sparkles className="w-4 h-4" />
          AI评价演示
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '当前等级', value: `Lv.${level}`, icon: <Star className="w-5 h-5 text-purple-600" />, sub: `${levelInfo.currentExp} EXP` },
              { label: '累计作品', value: `${(profile.artworks_count as number) || recentArtworks.length}`, icon: <Image className="w-5 h-5 text-blue-600" />, sub: '幅作品' },
              { label: '获得评价', value: `${recentArtworks.length}`, icon: <BookOpen className="w-5 h-5 text-green-600" />, sub: '次' },
              { label: '平均总分', value: `${((profile.avg_score as number) || 0).toFixed(1)}`, icon: <TrendingUp className="w-5 h-5 text-orange-600" />, sub: '分' },
            ].map((stat, i) => (
              <Card key={i}><CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label} · {stat.sub}</p>
              </CardContent></Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                最近作品五维分析              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <RadarChart data={radarData} />
                <div className="flex flex-col justify-center gap-2">
                  {radarData.map((d) => (
                    <div key={d.dimension} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{d.dimension}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(d.score / 3) * 100}%` }} />
                        </div>
                        <span className="text-sm font-bold text-purple-600 w-6">{scoreToLetter(d.score)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                成长轨迹              </CardTitle>
            </CardHeader>
            <CardContent><GrowthChart data={growthData} /></CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">最近作品</h2>
              <Link href="/student" className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                查看全部 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recentArtworks.map((artwork) => (
                <Link key={artwork.id} href={`/evaluation/${artwork.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm mb-1">{artwork.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${artwork.grade === '杰出' ? 'bg-purple-100 text-purple-700' : artwork.grade === '优秀' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{artwork.grade || '待审核'}</span>
                        <span className="text-xs text-gray-400">{artwork.total_score || '-'}分</span>
                      </div>
                      {artwork.ai_feedback && (<p className="text-xs text-gray-500 mt-2 line-clamp-2">{artwork.ai_feedback}</p>)}
                      <p className="text-xs text-purple-500 mt-1 font-medium flex items-center gap-1"><Sparkles className="w-3 h-3" /> 查看详细评价</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl"><Star className="w-6 h-6" /></div>
                <div><p className="text-purple-200 text-sm">当前等级</p><p className="text-3xl font-bold">Lv.{level}</p></div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-200">经验值 {levelInfo.currentExp} EXP</span>
                  <span className="text-purple-200">{levelInfo.nextExp} EXP 到下一级</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">待审核作品</CardTitle></CardHeader>
            <CardContent><p className="text-gray-400 text-sm text-center py-4">没有待审核的作品</p></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">我的徽章</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {DEMO_BADGES.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center text-center p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors cursor-pointer">
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <span className="text-xs font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">完成挑战解锁徽章</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
