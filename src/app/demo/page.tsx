'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadarChart } from '@/components/charts/radar-chart';
import { ScoreBreakdownChart } from '@/components/charts/score-breakdown';
import { Sparkles, ArrowRight, RefreshCw, Star, Loader2, Upload, Send, Bot, User, MessageSquare, Cloud, Monitor, Eye, Palette, Lightbulb, PenTool } from 'lucide-react';
import Link from 'next/link';
import { scoreToLetter } from '@/lib/utils';
import { smartMockEvaluate } from '@/lib/prompts';
import { saveArtwork, saveEvaluation } from '@/lib/local-db';

const DEMO_WORKS = [
  { id: 'demo-1', title: '夕阳下的校园', desc: '水彩画 · 三年级', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=450&fit=crop', mockResult: { dimensions: { '构图': { score: 3, level: '优秀', feedback: '主体突出布局饱满，空间层次处理得当！' }, '色彩': { score: 3, level: '优秀', feedback: '色调和谐优美，色彩情感表达很到位！' }, '造型': { score: 3, level: '优秀', feedback: '形态捕捉生动准确，线条流畅有表现力！' }, '创意': { score: 3, level: '优秀', feedback: '创意独特视角新颖，画面叙事感很强！' }, '完整性': { score: 2, level: '达标', feedback: '大部分区域处理得很好，注意画面四角的收尾' } }, total_score: 14, grade: '杰出' as const, overall_feedback: '这幅作品展现了出色的艺术感知力和表现技巧！构图均衡有层次，色彩运用成熟温暖。在细节完整性上稍加完善就更加完美了。' } },
  { id: 'demo-2', title: '海底世界', desc: '创意画 · 二年级', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=450&fit=crop', mockResult: { dimensions: { '构图': { score: 2, level: '达标', feedback: '构图规整，试试打破对称增加动感' }, '色彩': { score: 3, level: '优秀', feedback: '色彩层次丰富，明暗变化处理得很好！' }, '造型': { score: 2, level: '达标', feedback: '形态可以辨认，多观察实物会让造型更生动' }, '创意': { score: 3, level: '优秀', feedback: '想象力丰富，表达方式很有个人风格！' }, '完整性': { score: 2, level: '达标', feedback: '整体完成度可以，再检查一下遗漏的空白' } }, total_score: 12, grade: '优秀' as const, overall_feedback: '想象力非常丰富！海底世界充满了奇思妙想，色彩运用大胆有想法。在构图和造型细节上再加强一些会更加出色。' } },
  { id: 'demo-3', title: '未来的家', desc: '素描 · 四年级', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=450&fit=crop', mockResult: { dimensions: { '构图': { score: 2, level: '达标', feedback: '主体位置基本合理，可以尝试更有张力的构图' }, '色彩': { score: 3, level: '优秀', feedback: '冷暖搭配恰到好处，涂色细腻均匀' }, '造型': { score: 2, level: '达标', feedback: '造型基本准确，可以加强一些细节的刻画' }, '创意': { score: 3, level: '优秀', feedback: '题材立意新颖独特，有强烈的个人视角！' }, '完整性': { score: 2, level: '达标', feedback: '主体部分完成得不错，背景也可以再丰富一些' } }, total_score: 12, grade: '优秀' as const, overall_feedback: '创意新颖独特，画面有强烈的个人视角和情感表达。色彩处理也很有想法。在造型基础和构图完整度上继续努力。' } },
];

const GRADE_STYLES: Record<string, string> = {
  '杰出': 'from-purple-500 to-indigo-500 shadow-purple-500/30',
  '优秀': 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
  '良好': 'from-amber-500 to-orange-500 shadow-amber-500/30',
  '一般': 'from-gray-500 to-gray-600 shadow-gray-500/30',
};

const DIM_CONFIG: Record<string, { border: string; bg: string }> = {
  '构图': { border: 'border-purple-500/30', bg: 'bg-purple-500/5' },
  '色彩': { border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
  '造型': { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  '创意': { border: 'border-rose-500/30', bg: 'bg-rose-500/5' },
  '完整性': { border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
};

const DIM_ICONS: Record<string, string> = { '构图': '📐', '色彩': '🎨', '造型': '✏️', '创意': '💡', '完整性': '✅' };

interface ChatMessage { role: 'user' | 'assistant'; content: string; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvalResult = any;

export default function DemoPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult>(null);
  const [useRealAI, setUseRealAI] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedTitle, setUploadedTitle] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evalTiming, setEvalTiming] = useState<number>(0);

  const selectedWork = DEMO_WORKS.find((w) => w.id === selected);

  // Compress image to avoid Edge body size limit (max 1024px, JPEG quality 0.7)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const maxW = 1024;
          const scale = Math.min(1, maxW / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setError(null);
    compressImage(file).then((dataUrl) => {
      setUploadedImage(dataUrl);
      setUploadedTitle(file.name.replace(/\.[^.]+$/, ''));
      setResult(null);
      setChatMessages([]);
      setSelected(null);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file); }, [handleFileUpload]);

  const handleEvaluate = async (workId: string, workImage?: string, workTitle?: string, isUpload = false) => {
    setSelected(workId); setLoading(true); setResult(null); setChatMessages([]); setError(null); setEvalTiming(0);
    const img = isUpload ? uploadedImage : (workImage || DEMO_WORKS.find(w => w.id === workId)?.image);
    const title = isUpload ? uploadedTitle : (workTitle || DEMO_WORKS.find(w => w.id === workId)?.title);

    if (useRealAI) {
      const startTime = Date.now();
      try {
        const resp = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artwork_id: workId,
            image_data: isUpload ? img : undefined,
            image_url: !isUpload ? img : undefined,
            title: title || '未命名',
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setResult({ ...data, image: img });
          setEvalTiming(Date.now() - startTime);

          // Save to localStorage for the full pipeline demo
          const artworkRecord = {
            id: `local-${Date.now()}`,
            title: title || '未命名',
            image_url: img,
            student_id: '32e87443-4b26-473d-87b3-775d5bf415ce',
            created_at: new Date().toISOString(),
          };
          const dims = data.dimensions || {};
          const evalRecord = {
            artwork_id: artworkRecord.id,
            score_composition: dims['构图']?.score || 2,
            score_color: dims['色彩']?.score || 2,
            score_modeling: dims['造型']?.score || 2,
            score_creativity: dims['创意']?.score || 2,
            score_completeness: dims['完整性']?.score || 2,
            total_score: data.total_score || 10,
            grade: data.grade || '良好',
            ai_feedback: data.overall_feedback || '',
            status: 'pending_review',
          };
          saveArtwork(artworkRecord);
          saveEvaluation(evalRecord);

          setLoading(false);
          return;
        }
        // API error — show message
        const errData = await resp.json().catch(() => ({}));
        setError((errData as Record<string, string>).error || `AI服务返回错误 (${resp.status})`);
      } catch (e) {
        setError(`网络请求失败: ${e instanceof Error ? e.message : '请检查网络连接'}`);
      }
      // Fallback to mock
      const work = DEMO_WORKS.find(w => w.id === workId);
      if (work) { setResult({ ...work.mockResult, image: work.image }); setError(null); }
    } else {
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
      if (isUpload && title) {
        const mock = smartMockEvaluate(title);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dims = (mock as any).dimensions;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const genOverall = (d: any, t: string, ts: number, g: string) => {
          const dimNames = ['构图', '色彩', '造型', '创意', '完整性'];
          const best = dimNames.reduce((a, b) => d[a].score >= d[b].score ? a : b);
          const worst = dimNames.reduce((a, b) => d[a].score <= d[b].score ? a : b);
          const bestFb = d[best].feedback;
          const worstFb = d[worst].feedback;
          const areas: Record<string, string> = {
            '构图': '画面主体位置和空间布局',
            '色彩': '颜色搭配和色调处理',
            '造型': '物象的形态和线条表现',
            '创意': '题材选择和表达方式',
            '完整性': '画面的完成度和细节',
          };
          return `【画面描述】你上传的作品《${t}》，AI注意到了画面中的主要物象和整体色调氛围。\n\n【亮点】${best}维度表现最突出——${bestFb}这是你画面的亮点所在，继续保持这个方向。\n\n【提升点】${worst}方面还有进步空间——${worstFb}注意观察画面中的${areas[worst] || '细节'}，这里有明确的提升余地。\n\n【建议】下次创作时，优先关注${worst}的练习。可以从简单的观察练习开始，逐步提高。每一次创作都在积累经验，坚持下去一定会越来越好！`;
        };
        const grade = (mock as { grade: string }).grade;
        const ts = (mock as { total_score: number }).total_score;
        setResult({ ...mock, overall_feedback: genOverall(dims, title, ts, grade), image: img });
      } else { const work = DEMO_WORKS.find(w => w.id === workId); if (work) setResult({ ...work.mockResult, image: work.image }); }
    }
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !result) return;
    const question = chatInput.trim(); setChatInput(''); setChatMessages(prev => [...prev, { role: 'user', content: question }]); setChatLoading(true);
    try {
      const resp = await fetch('/api/evaluate/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: uploadedImage ? undefined : result.image || selectedWork?.image, image_data: uploadedImage || undefined, question, evaluation_context: { total_score: result.total_score, grade: result.grade, overall_feedback: result.overall_feedback, dimensions: result.dimensions }, history: chatMessages.map(m => ({ role: m.role, content: m.content })) }) });
      const data = await resp.json(); setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: '抱歉，AI暂时无法回应，请稍后再试。' }]); }
    setChatLoading(false); setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const dimDetails = result ? Object.entries(result.dimensions as Record<string, { score: number; level: string }>).map(([name, d]) => ({ dimension: name, score: d.score, letter: scoreToLetter(d.score) })) : [];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" /><div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px]" /></div>

      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div><span className="font-bold text-white">美育观止</span><span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">AI评价演示</span></Link>
          <div className="flex items-center gap-2">
            <button onClick={() => { setUseRealAI(!useRealAI); setResult(null); setChatMessages([]); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${useRealAI ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>{useRealAI ? <Cloud className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}{useRealAI ? 'Qwen-VL-Max' : '模拟'}</button>
            <Link href="/student"><Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">学生端</Button></Link>
            <Link href="/teacher"><Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">教师端</Button></Link>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8"><h1 className="text-3xl font-bold mb-2">AI 美育评价体验</h1><p className="text-gray-400">上传作品或选择示例，AI 从五个维度进行专业分析</p></div>

        {!result && (<>
          <div className={`max-w-xl mx-auto mb-10 border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${dragOver ? 'border-purple-400 bg-purple-500/10 scale-[1.02]' : 'border-white/10 hover:border-purple-500/30 hover:bg-white/5'} ${uploadedImage ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            {uploadedImage ? (<div><img src={uploadedImage} alt="作品" className="max-h-48 mx-auto rounded-xl shadow-2xl mb-4" /><p className="text-emerald-400 font-medium mb-1">作品已就绪</p><p className="text-sm text-gray-500 mb-3">{uploadedTitle || '未命名'}</p><Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={(e) => { e.stopPropagation(); handleEvaluate('upload', undefined, undefined, true); }} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}{loading ? 'AI分析中...' : '开始AI评价'}</Button></div>) : (<div><div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4"><Upload className="w-8 h-8 text-purple-400" /></div><p className="text-lg font-medium mb-1">点击或拖拽上传作品</p><p className="text-sm text-gray-500">JPG / PNG，最大 10MB</p></div>)}
          </div>
          <div className="flex items-center gap-4 max-w-xl mx-auto mb-10"><div className="flex-1 border-t border-white/10" /><span className="text-sm text-gray-500">或者选择示例</span><div className="flex-1 border-t border-white/10" /></div>
          <div className="grid md:grid-cols-3 gap-6">
            {DEMO_WORKS.map((work) => (<Card key={work.id} className={`overflow-hidden cursor-pointer transition-all duration-300 bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-xl hover:-translate-y-1 ${selected === work.id && loading ? 'ring-2 ring-purple-500/50' : ''}`} onClick={() => !loading && !uploadedImage && handleEvaluate(work.id, work.image, work.title)}><div className="aspect-[4/3] bg-gray-800 overflow-hidden"><img src={work.image} alt={work.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div><CardContent className="p-4"><h3 className="font-semibold text-white">{work.title}</h3><p className="text-sm text-gray-500">{work.desc}</p><div className="mt-2 flex items-center gap-2 text-purple-400 text-sm font-medium"><Sparkles className="w-4 h-4" />{loading && selected === work.id ? '分析中...' : '点击查看AI评价'}</div></CardContent></Card>))}
          </div>
        </>)}

        {error && !loading && (
          <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="font-medium mb-1">AI 调用失败</p>
              <p>{error}</p>
              <p className="text-xs text-red-500/60 mt-2">
                {error?.includes('413') || error?.includes('body') || error?.includes('413')
                  ? '图片过大，请尝试压缩后再上传（推荐小于2MB）'
                  : error?.includes('网络')
                    ? '请检查网络连接后重试'
                    : '已自动降级为模拟评价'}
              </p>
            </div>
          </div>
        )}
        {evalTiming > 0 && (
          <div className="max-w-xl mx-auto mb-4 text-center">
            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
              AI 评价耗时 {evalTiming < 1000 ? `${evalTiming}ms` : `${(evalTiming / 1000).toFixed(1)}s`}
            </span>
          </div>
        )}
        {loading && (<div className="text-center py-20"><div className="inline-flex items-center gap-3 text-purple-400"><Loader2 className="w-8 h-8 animate-spin" /><span className="text-xl font-medium">{useRealAI ? '千问视觉大模型分析中...' : 'AI五维度评价中...'}</span></div><p className="text-gray-500 mt-4">{useRealAI ? '真实AI调用，约需5-15秒' : '构图 · 色彩 · 造型 · 创意 · 完整性'}</p></div>)}

        {result && !loading && (<div className="space-y-6 animate-fade-in-up">
          <div className="grid md:grid-cols-2 gap-8">
            <div><div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"><img src={result.image || selectedWork?.image} alt="作品" className="w-full h-full object-cover" /></div></div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4"><div className={`px-6 py-5 rounded-2xl bg-gradient-to-r ${GRADE_STYLES[result.grade] || GRADE_STYLES['良好']} shadow-xl`}><p className="text-5xl font-bold text-white">{result.grade}</p></div><div><p className="text-4xl font-bold text-purple-400">{result.total_score}<span className="text-xl text-gray-500 font-normal">/15</span></p><p className="text-sm text-gray-500">综合总分{evalTiming > 0 && <span className="text-purple-400 ml-1">· {(evalTiming / 1000).toFixed(1)}s</span>}</p></div></div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm"><div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-purple-400" /><span className="text-sm font-medium text-purple-400">AI 综合评价</span></div><p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">{result.overall_feedback}</p></div>
            </div>
          </div>

          {/* ===== 画面描述 ===== */}
          {result.visual_description && (
            <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-6 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px]" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center"><Eye className="w-4 h-4 text-cyan-400" /></div>
                  <h3 className="text-lg font-bold text-cyan-400">画面描述</h3>
                  <span className="text-xs text-cyan-500/60 bg-cyan-500/10 px-2 py-0.5 rounded-full">AI 视觉解析</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm">{result.visual_description}</p>
              </div>
            </div>
          )}

          {/* ===== 大师级引导 ===== */}
          {result.master_guidance?.reference && (
            <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 p-6 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px]" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><Palette className="w-4 h-4 text-amber-400" /></div>
                  <h3 className="text-lg font-bold text-amber-400">大师级引导</h3>
                  <span className="text-xs text-amber-500/60 bg-amber-500/10 px-2 py-0.5 rounded-full">引用：{result.master_guidance.reference}</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-amber-400/60 font-medium mb-1">观察发现</p>
                    <p className="text-sm text-gray-300">{result.master_guidance.observation}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-amber-400/60 font-medium mb-1">改进建议</p>
                    <p className="text-sm text-gray-300">{result.master_guidance.suggestion}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== 视觉重构方案 ===== */}
          {result.visual_reconstruction?.keep && (
            <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-6 backdrop-blur-sm">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Lightbulb className="w-4 h-4 text-emerald-400" /></div>
                  <h3 className="text-lg font-bold text-emerald-400">视觉重构方案</h3>
                  <span className="text-xs text-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 rounded-full">AI 辅助提升</span>
                </div>

                {/* 保留 */}
                <div className="mb-4">
                  <p className="text-xs text-emerald-400/70 font-medium mb-2 flex items-center gap-1">
                    <span className="text-base">✓</span> 保留优势
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.visual_reconstruction.keep as string[]).map((item: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-300">{item}</span>
                    ))}
                  </div>
                </div>

                {/* 调整 */}
                <div className="mb-4">
                  <p className="text-xs text-amber-400/70 font-medium mb-2 flex items-center gap-1">
                    <PenTool className="w-3 h-3" /> 调整方案
                  </p>
                  <div className="space-y-2">
                    {(result.visual_reconstruction.adjust as Array<{area: string; change: string; expected_effect: string}>).map((adj, i: number) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 grid grid-cols-[1fr_2fr_2fr] gap-3 text-xs">
                        <div>
                          <span className="text-amber-400/60 block mb-0.5">位置</span>
                          <span className="text-gray-300">{adj.area}</span>
                        </div>
                        <div>
                          <span className="text-amber-400/60 block mb-0.5">改动</span>
                          <span className="text-gray-300">{adj.change}</span>
                        </div>
                        <div>
                          <span className="text-emerald-400/60 block mb-0.5">预期效果</span>
                          <span className="text-gray-300">{adj.expected_effect}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 升级预览 */}
                {result.visual_reconstruction.upgraded_look && (
                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400/60 font-medium mb-1">升级预览</p>
                    <p className="text-sm text-gray-200 leading-relaxed italic">{result.visual_reconstruction.upgraded_look}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <h2 className="text-xl font-bold">五维度详细分析</h2>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(result.dimensions as Record<string, { score: number; level: string; feedback: string }>).map(([name, d]) => (<Card key={name} className={`border bg-white/5 backdrop-blur-sm card-hover ${DIM_CONFIG[name]?.border || 'border-white/10'} ${DIM_CONFIG[name]?.bg || ''}`}><CardContent className="p-4 text-center"><span className="text-2xl">{DIM_ICONS[name]}</span><h3 className="font-bold mt-1">{name}</h3><div className="flex justify-center gap-1 my-2">{[1, 2, 3].map((s) => (<div key={s} className={`w-4 h-7 rounded-sm ${s <= d.score ? 'bg-purple-500' : 'bg-white/10'}`} />))}</div><span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${d.score >= 3 ? 'bg-green-500/20 text-green-400' : d.score >= 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>{d.level} · {scoreToLetter(d.score)}</span><p className="text-xs text-gray-500 mt-2 leading-relaxed">{d.feedback}</p></CardContent></Card>))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="text-sm text-gray-300">五维能力雷达图</CardTitle></CardHeader><CardContent><RadarChart data={Object.entries(result.dimensions as Record<string, { score: number }>).map(([name, d]) => ({ dimension: name, score: d.score }))} /></CardContent></Card>
            <Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="text-sm text-gray-300">维度得分对比</CardTitle></CardHeader><CardContent><ScoreBreakdownChart data={dimDetails} /></CardContent></Card>
          </div>

          {/* AI Chat */}
          <Card className="bg-white/5 border-purple-500/30">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-gray-300"><MessageSquare className="w-4 h-4 text-purple-400" />向 AI 提问这幅作品<span className="text-xs font-normal text-gray-500">（构图/色彩/改进建议等）</span></CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {chatMessages.length === 0 && (<div className="text-center py-6"><Bot className="w-8 h-8 mx-auto mb-2 text-purple-500/30" /><p className="text-sm text-gray-500">试试这些问题：</p><div className="flex flex-wrap justify-center gap-2 mt-2">{['这幅画构图怎么改进？', '色彩搭配有什么建议？', '如何提高创意能力？', '这幅作品最大的亮点是什么？'].map((q) => (<button key={q} onClick={() => setChatInput(q)} className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs rounded-full transition-colors">{q}</button>))}</div></div>)}
                {chatMessages.map((msg, i) => (<div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>{msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><Bot className="w-4 h-4 text-purple-400" /></div>}<div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-md' : 'bg-white/5 text-gray-300 border border-white/10 rounded-tl-md'}`}>{msg.content}</div>{msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5"><User className="w-4 h-4 text-gray-400" /></div>}</div>))}
                {chatLoading && <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Bot className="w-4 h-4 text-purple-400" /></div><div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-md px-4 py-2.5"><Loader2 className="w-4 h-4 animate-spin text-purple-400" /></div></div>}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChat()} placeholder="问 AI 关于这幅作品的任何问题..." className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm text-white placeholder-gray-500" /><Button size="sm" onClick={handleChat} disabled={chatLoading || !chatInput.trim()} className="bg-purple-600 hover:bg-purple-500"><Send className="w-4 h-4" /></Button></div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-3 pt-2 pb-12">
            <Button variant="outline" onClick={() => { setResult(null); setSelected(null); setUploadedImage(null); setUploadedTitle(''); setChatMessages([]); }} className="gap-2 border-white/20 text-gray-300 hover:bg-white/10"><RefreshCw className="w-4 h-4" />重新上传/选择</Button>
            <Link href="/student"><Button className="gap-1 bg-gradient-to-r from-purple-600 to-indigo-600"><Star className="w-4 h-4" />学生端</Button></Link>
            <Link href="/teacher"><Button variant="outline" className="gap-1 border-white/20 text-gray-300">教师端 <ArrowRight className="w-3 h-3" /></Button></Link>
          </div>
        </div>)}
      </div>
    </div>
  );
}
