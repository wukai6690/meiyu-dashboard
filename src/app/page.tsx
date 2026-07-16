import Link from 'next/link';
import { Sparkles, TrendingUp, Users, BarChart3, Paintbrush, Brain, ArrowRight, Star, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/50 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">美育观止</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/student" className="text-sm text-gray-300 hover:text-white transition-colors">学生端</Link>
            <Link href="/teacher" className="text-sm text-gray-300 hover:text-white transition-colors">教师端</Link>
            <Link href="/demo" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              <Sparkles className="w-4 h-4" />立即体验
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-gray-300">AI 驱动的 K12 美育评价新时代</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
            让每一幅作品
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            都被温柔地看见
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          基于多模态视觉大模型，从
          <span className="text-purple-400 font-semibold">构图</span>·
          <span className="text-amber-400 font-semibold">色彩</span>·
          <span className="text-emerald-400 font-semibold">造型</span>·
          <span className="text-rose-400 font-semibold">创意</span>·
          <span className="text-blue-400 font-semibold">完整性</span>
          五个维度，为每一幅学生美术作品生成专业、温暖的评价
        </p>
        <p className="text-gray-500 max-w-xl mx-auto mb-12 text-sm">
          AI 辅助而非 AI 裁决 · 人机协同保留人文温度 · 让美育评价从经验走向数据驱动
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/demo" className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            体验 AI 评价
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/student" className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/20 rounded-2xl text-lg font-medium hover:bg-white/10 transition-all backdrop-blur-sm">
            查看学生端 <ArrowRight className="w-4 h-4 opacity-50" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20">
          {[
            { value: '5', label: '评价维度', sub: '构图·色彩·造型·创意·完整性' },
            { value: '15', label: '满分制', sub: '每个维度1-3分' },
            { value: '4', label: '评价等级', sub: '杰出·优秀·良好·一般' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Five Dimensions */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">五维评价体系</h2>
          <p className="text-gray-400">将抽象的"美"科学拆解为可观测指标</p>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { icon: <BarChart3 className="w-6 h-6" />, name: '构图', desc: '空间布局', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30', text: 'text-purple-400' },
            { icon: <Paintbrush className="w-6 h-6" />, name: '色彩', desc: '搭配运用', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30', text: 'text-amber-400' },
            { icon: <Brain className="w-6 h-6" />, name: '造型', desc: '形态线条', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30', text: 'text-emerald-400' },
            { icon: <Sparkles className="w-6 h-6" />, name: '创意', desc: '想象独特', color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30', text: 'text-rose-400' },
            { icon: <TrendingUp className="w-6 h-6" />, name: '完整性', desc: '细节完成', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30', text: 'text-blue-400' },
          ].map((dim) => (
            <div key={dim.name} className={`relative rounded-2xl border ${dim.color} bg-gradient-to-br p-6 backdrop-blur-sm hover:scale-105 transition-transform group cursor-default`}>
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${dim.text} group-hover:scale-110 transition-transform`}>
                {dim.icon}
              </div>
              <h3 className="font-bold text-lg mb-1">{dim.name}</h3>
              <p className="text-sm text-gray-500">{dim.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">为什么选择美育观止</h2>
          <p className="text-gray-400">技术 + 美学 + 教育 = 三位一体</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Zap className="w-6 h-6" />, title: 'AI 智能评价', tag: '核心技术', desc: '千问视觉大模型秒级分析，五维度量化评分，维度级评语与改进建议，让美育评价从经验走向科学。' },
            { icon: <Shield className="w-6 h-6" />, title: '人机协同机制', tag: '创新理念', desc: 'AI初评 + 教师审核双轨制。AI辅助而非AI裁决，保留教师最终审核权，确保评价的专业性与人文温度。' },
            { icon: <Star className="w-6 h-6" />, title: '成长档案系统', tag: '长期价值', desc: '为每位学生建立专属美育档案，可视化成长轨迹。基于最近发展区理论生成个性化阶段性报告，让进步被看见。' },
          ].map((f, i) => (
            <div key={i} className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-4 text-purple-400">
                {f.icon}
              </div>
              <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full mb-3 inline-block">{f.tag}</span>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-white/10 backdrop-blur-sm p-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[80px]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">准备好体验 AI 美育评价了吗？</h2>
            <p className="text-gray-400 text-lg mb-8">无需注册，上传作品即可体验 AI 五维度分析</p>
            <div className="flex justify-center gap-4">
              <Link href="/demo" className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl hover:scale-105">
                <Sparkles className="w-5 h-5 text-purple-600" />
                立即体验
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/teacher" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl text-lg font-medium hover:bg-white/20 transition-all">
                查看教师端
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-8 text-center">
        <p className="text-gray-500 text-sm">美育观止 · AI美育评价系统 · 华东师范大学美术学院</p>
        <p className="text-gray-600 text-xs mt-1">AI 辅助而非 AI 裁决 · 让人文温度回归美育评价</p>
      </footer>
    </div>
  );
}
