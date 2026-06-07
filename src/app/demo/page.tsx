'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadarChart } from '@/components/charts/radar-chart';
import { ScoreBreakdownChart } from '@/components/charts/score-breakdown';
import { Sparkles, ArrowRight, RefreshCw, Star, Award, TrendingUp, Lightbulb, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { scoreToLetter } from '@/lib/utils';

const DEMO_WORKS = [
  {
    id: 'demo-1',
    title: '夕阳下的校园',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=450&fit=crop',
    desc: '水彩画 · 三年级',
    mockResult: {
      dimensions: {
        '构图': { score: 3, level: '优秀', feedback: '主体突出布局饱满，空间层次处理得当！' },
        '色彩': { score: 3, level: '优秀', feedback: '色调和谐优美，色彩情感表达很到位！' },
        '造型': { score: 3, level: '优秀', feedback: '形态捕捉生动准确，线条流畅有表现力！' },
        '创意': { score: 3, level: '优秀', feedback: '创意独特视角新颖，画面叙事感很强！' },
        '完整性': { score: 2, level: '达标', feedback: '大部分区域处理得很好，注意画面四角的收尾' },
      },
      total_score: 14,
      grade: '杰出' as const,
      overall_feedback: '这幅作品展现了出色的艺术感知力和表现技巧！构图均衡有层次，色彩运用成熟温暖，画面整体感染力很强。在细节完整性上稍加完善就更加完美了。继续保持这份创作热情！',
    },
  },
  {
    id: 'demo-2',
    title: '海底世界',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=450&fit=crop',
    desc: '创意画 · 二年级',
    mockResult: {
      dimensions: {
        '构图': { score: 2, level: '达标', feedback: '构图规整，试试打破对称增加动感' },
        '色彩': { score: 3, level: '优秀', feedback: '色彩层次丰富，明暗变化处理得很好！' },
        '造型': { score: 2, level: '达标', feedback: '形态可以辨认，多观察实物会让造型更生动' },
        '创意': { score: 3, level: '优秀', feedback: '想象力丰富，表达方式很有个人风格！' },
        '完整性': { score: 2, level: '达标', feedback: '整体完成度可以，再检查一下遗漏的空白' },
      },
      total_score: 12,
      grade: '优秀' as const,
      overall_feedback: '想象力非常丰富！海底世界充满了奇思妙想，色彩运用大胆有想法。在构图和造型细节上再加强一些，你的作品会更加出色。每一幅画都是进步的阶梯。',
    },
  },
  {
    id: 'demo-3',
    title: '未来的家',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=450&fit=crop',
    desc: '素描 · 四年级',
    mockResult: {
      dimensions: {
        '构图': { score: 2, level: '达标', feedback: '主体位置基本合理，可以尝试更有张力的构图' },
        '色彩': { score: 3, level: '优秀', feedback: '冷暖搭配恰到好处，涂色细腻均匀' },
        '造型': { score: 2, level: '达标', feedback: '造型基本准确，可以加强一些细节的刻画' },
        '创意': { score: 3, level: '优秀', feedback: '题材立意新颖独特，有强烈的个人视角和情感表达！' },
        '完整性': { score: 2, level: '达标', feedback: '主体部分完成得不错，背景也可以再丰富一些' },
      },
      total_score: 12,
      grade: '优秀' as const,
      overall_feedback: '创意新颖独特，画面有强烈的个人视角和情感表达，这是最珍贵的艺术品质！色彩处理也很有想法。在造型基础和构图完整度上继续努力，你的潜力无限。',
    },
  },
];

const GRADE_STYLES: Record<string, string> = {
  '杰出': 'bg-gradient-to-r from-purple-600 to-indigo-600',
  '优秀': 'bg-gradient-to-r from-emerald-500 to-teal-500',
  '良好': 'bg-gradient-to-r from-amber-400 to-orange-400',
  '一般': 'bg-gradient-to-r from-gray-400 to-gray-500',
};

const DIM_COLOR_MAP: Record<string, string> = {
  '构图': 'border-purple-300 bg-purple-50',
  '色彩': 'border-amber-300 bg-amber-50',
  '造型': 'border-emerald-300 bg-emerald-50',
  '创意': 'border-rose-300 bg-rose-50',
  '完整性': 'border-blue-300 bg-blue-50',
};

const DIM_ICONS: Record<string, string> = {
  '构图': '📐',
  '色彩': '🎨',
  '造型': '✏️',
  '创意': '💡',
  '完整性': '✅',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvalResult = typeof DEMO_WORKS[0]['mockResult'] | null;

export default function DemoPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult>(null);
  const [useRealAI, setUseRealAI] = useState(false);

  const selectedWork = DEMO_WORKS.find((w) => w.id === selected);

  const handleEvaluate = async (workId: string) => {
    setSelected(workId);
    setLoading(true);
    setResult(null);

    const work = DEMO_WORKS.find((w) => w.id === workId);
    if (!work) return;

    if (useRealAI) {
      try {
        const resp = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artwork_id: workId,
            image_url: work.image,
            title: work.title,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setResult({
            dimensions: data.dimensions,
            total_score: data.total_score,
            grade: data.grade,
            overall_feedback: data.overall_feedback,
          });
        } else {
          // Fall back to mock
          setResult(work.mockResult);
        }
      } catch {
        setResult(work.mockResult);
      }
    } else {
      // Simulate AI thinking time for drama
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
      setResult(work.mockResult);
    }
    setLoading(false);
  };

  const dimDetails = result
    ? Object.entries(result.dimensions).map(([name, d]) => ({
        dimension: name,
        score: d.score,
        letter: scoreToLetter(d.score),
      }))
    : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">美育观止</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">AI评价演示</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/student"><Button variant="ghost" size="sm">学生端</Button></Link>
            <Link href="/teacher"><Button variant="ghost" size="sm">教师端</Button></Link>
            <Link href="/"><Button variant="ghost" size="sm">返回首页</Button></Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI 多模态评价能力演示
          </div>
          <h1 className="text-3xl font-bold mb-2">选择一幅作品，看看 AI 怎么评价</h1>
          <p className="text-gray-500">
            {useRealAI
              ? '🔵 当前模式：真实千问视觉大模型（Qwen-VL-Max）'
              : '🟣 当前模式：智能模拟评价 · '}
            <button
              onClick={() => setUseRealAI(!useRealAI)}
              className="text-purple-600 hover:text-purple-700 underline font-medium"
            >
              {useRealAI ? '切换到模拟模式' : '切换到真实AI模式'}
            </button>
          </p>
        </div>

        {/* Artwork Selection */}
        {!result && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {DEMO_WORKS.map((work) => (
              <Card
                key={work.id}
                className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  selected === work.id && loading ? 'ring-2 ring-purple-400 animate-pulse' : ''
                }`}
                onClick={() => !loading && handleEvaluate(work.id)}
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img src={work.image} alt={work.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{work.title}</h3>
                  <p className="text-sm text-gray-400">{work.desc}</p>
                  <div className="mt-3 flex items-center gap-2 text-purple-600 text-sm font-medium">
                    {loading && selected === work.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI 正在分析中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        点击查看AI评价
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-purple-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xl font-medium">
                {useRealAI ? 'AI 正在分析这幅作品...' : 'AI 正在从五个维度进行评价...'}
              </span>
            </div>
            <p className="text-gray-400 mt-4">
              {useRealAI ? '调用千问视觉大模型，通常需要5-15秒' : '构图·色彩·造型·创意·完整性'}
            </p>
          </div>
        )}

        {/* Results */}
        {result && selectedWork && !loading && (
          <div className="space-y-8">
            {/* Top: Artwork + Grade */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                  <img src={selectedWork.image} alt={selectedWork.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-center mt-3 text-gray-500">{selectedWork.title} · {selectedWork.desc}</p>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`px-6 py-5 rounded-2xl text-white ${GRADE_STYLES[result.grade]}`}>
                    <p className="text-5xl font-bold">{result.grade}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-purple-600">
                      {result.total_score}
                      <span className="text-xl text-gray-400 font-normal"> / 15</span>
                    </p>
                    <p className="text-sm text-gray-500">综合总分</p>
                  </div>
                </div>
                {/* AI Feedback */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">AI 综合评价</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{result.overall_feedback}</p>
                </div>
              </div>
            </div>

            {/* Five Dimensions Detail */}
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              五维度详细分析
            </h2>
            <div className="grid md:grid-cols-5 gap-3">
              {Object.entries(result.dimensions).map(([name, d]) => (
                <Card key={name} className={`border-2 ${DIM_COLOR_MAP[name]}`}>
                  <CardContent className="p-4 text-center">
                    <span className="text-2xl">{DIM_ICONS[name]}</span>
                    <h3 className="font-bold mt-2">{name}</h3>
                    <div className="flex justify-center gap-1 my-2">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`w-4 h-7 rounded-sm transition-all ${
                            s <= d.score ? 'bg-purple-600' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                      d.score >= 3 ? 'bg-green-100 text-green-700' : d.score >= 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {d.level} · {scoreToLetter(d.score)}
                    </span>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{d.feedback}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-sm">五维能力雷达图</CardTitle></CardHeader>
                <CardContent>
                  <RadarChart data={Object.entries(result.dimensions).map(([name, d]) => ({
                    dimension: name,
                    score: d.score,
                  }))} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">维度得分对比</CardTitle></CardHeader>
                <CardContent>
                  <ScoreBreakdownChart data={dimDetails} />
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-4 pb-12">
              <Button
                variant="outline"
                onClick={() => { setResult(null); setSelected(null); }}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                评价其他作品
              </Button>
              <Link href="/student">
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600">
                  <Star className="w-4 h-4" />
                  查看学生端完整功能
                </Button>
              </Link>
              <Link href="/teacher">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  查看教师端分析面板
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
