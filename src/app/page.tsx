import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Users, BarChart3, Paintbrush, Brain } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">美育观止</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/student"><Button variant="ghost">学生端</Button></Link>
            <Link href="/teacher"><Button variant="ghost">教师端</Button></Link>
            <Link href="/demo"><Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600">立即体验</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          AI 驱动的 K12 美育评价新时代
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent leading-tight">
          让每一幅作品<br/>都被温柔地看见
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          美育观止基于多模态视觉大模型，从<strong className="text-purple-600">构图、色彩、造型、创意、完整性</strong>五个维度，
          为每一幅学生美术作品生成专业、温暖、建设性的评价。
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto mb-10">
          AI 辅助而非 AI 裁决 · 人机协同保留人文温度 · 让美育评价从经验走向数据驱动
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/demo">
            <Button size="lg" className="gap-2 text-lg px-10 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200">
              <Sparkles className="w-5 h-5" />
              体验 AI 评价
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/student">
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 h-14">
              查看学生端
            </Button>
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">AI 五维评价体系</h2>
        <p className="text-gray-500 text-center mb-12">将抽象的"美"科学拆解为五个可观测指标，让美育评价有据可依</p>
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          {[
            { icon: <BarChart3 className="w-6 h-6" />, name: '构图', desc: '空间布局·画面平衡·层次感', color: 'border-purple-400 bg-purple-50' },
            { icon: <Paintbrush className="w-6 h-6" />, name: '色彩', desc: '色调协调·层次丰富·情感表达', color: 'border-amber-400 bg-amber-50' },
            { icon: <Brain className="w-6 h-6" />, name: '造型', desc: '形态把握·比例结构·线条表现', color: 'border-emerald-400 bg-emerald-50' },
            { icon: <Sparkles className="w-6 h-6" />, name: '创意', desc: '立意新颖·手法独特·情感叙事', color: 'border-rose-400 bg-rose-50' },
            { icon: <TrendingUp className="w-6 h-6" />, name: '完整性', desc: '完成度·细节处理·认真态度', color: 'border-blue-400 bg-blue-50' },
          ].map((dim) => (
            <div key={dim.name} className={`rounded-2xl border-2 ${dim.color} p-5 text-center hover:shadow-md transition-shadow`}>
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 text-purple-600">{dim.icon}</div>
              <h3 className="font-bold text-lg mb-1">{dim.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{dim.desc}</p>
            </div>
          ))}
        </div>

        {/* 评分等级说明 */}
        <div className="grid grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { grade: '杰出', range: '14-15分', color: 'bg-purple-600', desc: '五维均衡突出' },
            { grade: '优秀', range: '12-13分', color: 'bg-green-500', desc: '多维度表现良好' },
            { grade: '良好', range: '10-11分', color: 'bg-amber-500', desc: '有明确提升方向' },
            { grade: '一般', range: '5-9分', color: 'bg-gray-400', desc: '基础阶段，鼓励为主' },
          ].map((g) => (
            <div key={g.grade} className="text-center">
              <div className={`${g.color} text-white rounded-xl py-3 mb-2`}>
                <p className="text-2xl font-bold">{g.grade}</p>
              </div>
              <p className="text-xs text-gray-500">{g.range} · {g.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Three Pillars */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">为什么选择美育观止</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Sparkles className="w-8 h-8 text-purple-600" />,
              title: 'AI 智能评价 · 五维量化',
              desc: '基于千问视觉大模型，从构图、色彩、造型、创意、完整性五个维度进行秒级自动评价。每个维度输出1-3分评级 + 专业评语 + 提升建议，让美育评价不再依赖主观经验。',
              tag: '核心技术',
            },
            {
              icon: <Users className="w-8 h-8 text-indigo-600" />,
              title: '人机协同 · 温度与标准并存',
              desc: '确立"AI辅助而非AI裁决"的边界。AI完成初评，教师保留最终审核权。系统自动生成班级维度雷达图和教学建议，帮助教师快速定位共性薄弱点，实现精准教学。',
              tag: '创新理念',
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
              title: '成长档案 · 让进步被看见',
              desc: '为每位学生建立专属美育成长档案，可视化展示五维能力的纵向变化轨迹。结合维果茨基"最近发展区"理论，生成个性化阶段性成长报告。',
              tag: '长期价值',
            },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-4">{f.icon}</div>
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium mb-3 inline-block">{f.tag}</span>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Preview */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">看看 AI 怎么评价一幅画</h2>
        <p className="text-gray-500 text-center mb-8">真实多模态大模型分析 · 五维度分层评价 · 即时生成结果</p>
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-3xl p-8 shadow-sm border">
          <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=450&fit=crop" alt="示例作品" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏆</span>
              <span className="text-3xl font-bold text-purple-600">杰出</span>
              <span className="text-lg text-gray-400">14/15分</span>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { dim: '构图', score: 3, text: '主体突出布局饱满，空间层次处理得当' },
                { dim: '色彩', score: 3, text: '色调和谐优美，情感表达到位' },
                { dim: '造型', score: 3, text: '形态捕捉生动，线条流畅有表现力' },
                { dim: '创意', score: 3, text: '视角新颖独特，画面叙事感强' },
                { dim: '完整性', score: 2, text: '大部分区域完整，注意四角收尾' },
              ].map((d) => (
                <div key={d.dim} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-16">{d.dim}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (<div key={s} className={`w-3 h-5 rounded-sm ${s <= d.score ? 'bg-purple-600' : 'bg-gray-200'}`} />))}
                  </div>
                  <span className="text-sm text-gray-600">{d.text}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed bg-purple-50 rounded-xl p-4 text-sm">
              <span className="text-purple-600 font-medium">AI 综合评价：</span>
              这幅作品展现了出色的艺术感知力！五个维度均有不俗表现，画面中流露出的真诚与投入最令人欣喜。继续保持这份创作热情，你正在成长为一名出色的小艺术家。
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">准备好体验 AI 美育评价了吗？</h2>
          <p className="text-purple-100 text-lg mb-8">
            无需注册，即刻体验 AI 如何从五个维度评价一幅美术作品
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/demo">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 gap-2 text-lg px-10 h-14">
                <Sparkles className="w-5 h-5" />
                立即体验
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-gray-500 text-sm">
        <p>美育观止 · AI美育评价系统 · 华东师范大学美术学院</p>
      </footer>
    </div>
  );
}
