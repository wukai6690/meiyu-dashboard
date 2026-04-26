import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react';

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
            <Link href="/login">
              <Button variant="ghost">登录</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">立即体验</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          AI 驱动的美育评价新时代
        </div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          用 AI 点亮每一份独特的艺术天赋
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          美育观止是一款基于多模态大模型的 K12 美育数字化评价平台，
          为学生、教师和家长提供科学、专业、个性化的美育成长分析。
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="gap-2 text-lg px-8 h-14">
              立即开始
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">为什么选择美育观止</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Sparkles className="w-8 h-8 text-purple-600" />,
              title: 'AI 智能评价',
              desc: '基于 Qwen-VL-Max 多模态大模型，从构图、色彩、造型、创意、完整性五个维度进行专业评价',
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
              title: '成长档案',
              desc: '记录每一次创作的点滴进步，可视化展示艺术成长轨迹，让进步看得见',
            },
            {
              icon: <Users className="w-8 h-8 text-blue-600" />,
              title: '人机协同',
              desc: 'AI 初评 + 教师审核双轨机制，确保评价的专业性与公正性，保留人文温度',
            },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">准备好开启美育之旅了吗？</h2>
          <p className="text-purple-100 text-lg mb-8">加入美育观止，让 AI 成为您艺术成长道路上的得力助手</p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 gap-2 text-lg px-10 h-14">
              立即注册
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-gray-500 text-sm">
        <p>美育观止 - AI美育作品集看板系统</p>
      </footer>
    </div>
  );
}
