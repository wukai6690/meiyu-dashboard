'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface Props { data: { dimension: string; score: number }[]; }

export function RadarChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, 'dark');
    chart.setOption({
      radar: {
        indicator: data.map((d) => ({ name: d.dimension, max: 3 })),
        shape: 'polygon', splitNumber: 3,
        center: ['50%', '52%'], radius: '72%',
        axisName: { color: '#9ca3af', fontSize: 12, padding: [3, 5] },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        splitArea: { areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)'] } },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [{
        type: 'radar',
        data: [{ value: data.map((d) => d.score), name: '五维分析', areaStyle: { color: 'rgba(139, 92, 246, 0.25)' }, lineStyle: { color: '#a78bfa', width: 2 }, itemStyle: { color: '#a78bfa' }, symbolSize: 6 }],
      }],
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [data]);

  return <div ref={chartRef} className="w-full h-64" />;
}
