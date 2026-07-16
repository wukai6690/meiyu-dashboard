'use client';

import { useEffect, useState } from 'react';

interface ScoreItem { dimension: string; score: number; letter: string; }

interface Props { data: ScoreItem[]; }

const DIM_CONFIG: Record<string, { bar: string; bg: string; icon: string }> = {
  '构图': { bar: 'bg-purple-500', bg: 'bg-purple-500/10', icon: '📐' },
  '色彩': { bar: 'bg-amber-500', bg: 'bg-amber-500/10', icon: '🎨' },
  '造型': { bar: 'bg-emerald-500', bg: 'bg-emerald-500/10', icon: '✏️' },
  '创意': { bar: 'bg-rose-500', bg: 'bg-rose-500/10', icon: '💡' },
  '完整性': { bar: 'bg-blue-500', bg: 'bg-blue-500/10', icon: '✅' },
};

const LEVEL_STYLES: Record<string, string> = {
  'A': 'text-emerald-400 bg-emerald-500/10', 'B': 'text-amber-400 bg-amber-500/10', 'C': 'text-gray-400 bg-white/5',
};

export function ScoreBreakdownChart({ data }: Props) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const c = DIM_CONFIG[item.dimension] || DIM_CONFIG['构图'];
        const pct = (item.score / 3) * 100;
        return (
          <div key={item.dimension}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2"><span className="text-sm">{c.icon}</span><span className="text-sm font-medium text-gray-300">{item.dimension}</span></div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_STYLES[item.letter] || LEVEL_STYLES['B']}`}>{item.letter}级</span>
            </div>
            <div className={`h-8 rounded-lg overflow-hidden ${c.bg} relative`}>
              <div className="absolute inset-0 flex"><div className="flex-1 border-r border-white/5" /><div className="flex-1 border-r border-white/5" /><div className="flex-1" /></div>
              <div className={`h-full ${c.bar} rounded-lg transition-all duration-1000 ease-out flex items-center justify-end px-2`} style={{ width: animated ? `${pct}%` : '0%', transitionDelay: `${i * 80}ms` }}><span className="text-white text-xs font-bold">{item.score}/3</span></div>
              <div className="absolute top-1/2 -translate-y-1/2 right-3 flex gap-1.5">{[1, 2, 3].map((dot) => (<div key={dot} className={`w-2 h-2 rounded-full transition-all ${dot <= item.score ? 'bg-white shadow-sm' : 'bg-white/10'}`} />))}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
