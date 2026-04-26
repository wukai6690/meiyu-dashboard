'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface GrowthPoint {
  date: string;
  exp: number;
  score: number;
}

interface Props {
  data: GrowthPoint[];
}

export function GrowthChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['经验值', '平均分'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date),
        boundaryGap: false,
      },
      yAxis: [
        { type: 'value', name: '经验值', splitLine: { lineStyle: { type: 'dashed' } } },
        { type: 'value', name: '平均分', max: 15, splitLine: { lineStyle: { type: 'dashed' } } },
      ],
      series: [
        {
          name: '经验值',
          type: 'line',
          data: data.map((d) => d.exp),
          smooth: true,
          lineStyle: { color: '#8b5cf6', width: 2 },
          itemStyle: { color: '#8b5cf6' },
          areaStyle: { color: 'rgba(139,92,246,0.1)' },
        },
        {
          name: '平均分',
          type: 'line',
          yAxisIndex: 1,
          data: data.map((d) => d.score),
          smooth: true,
          lineStyle: { color: '#f59e0b', width: 2 },
          itemStyle: { color: '#f59e0b' },
        },
      ],
    };
    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="w-full h-64" />;
}
