'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface Props { data: { date: string; exp: number; score: number }[]; }

export function GrowthChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, 'dark');
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['经验值', '均分'], bottom: 0, textStyle: { color: '#9ca3af' } },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: data.map((d) => d.date), boundaryGap: false, axisLine: { lineStyle: { color: '#374151' } }, axisLabel: { color: '#9ca3af' } },
      yAxis: [
        { type: 'value', name: 'EXP', nameTextStyle: { color: '#9ca3af' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } }, axisLabel: { color: '#9ca3af' } },
        { type: 'value', name: '均分', max: 15, nameTextStyle: { color: '#9ca3af' }, splitLine: { show: false }, axisLabel: { color: '#9ca3af' } },
      ],
      series: [
        { name: '经验值', type: 'line', data: data.map((d) => d.exp), smooth: true, lineStyle: { color: '#a78bfa', width: 2 }, itemStyle: { color: '#a78bfa' }, areaStyle: { color: 'rgba(139,92,246,0.15)' } },
        { name: '均分', type: 'line', yAxisIndex: 1, data: data.map((d) => d.score), smooth: true, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' } },
      ],
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [data]);

  return <div ref={chartRef} className="w-full h-64" />;
}
