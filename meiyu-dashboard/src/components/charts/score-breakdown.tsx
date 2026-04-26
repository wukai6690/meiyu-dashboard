'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface ScoreItem {
  dimension: string;
  score: number;
  letter: string;
}

interface Props {
  data: ScoreItem[];
}

const DIMENSION_COLORS: Record<string, string> = {
  '构图': '#8b5cf6',
  '色彩': '#f59e0b',
  '造型': '#10b981',
  '创意': '#ef4444',
  '完整性': '#3b82f6',
};

export function ScoreBreakdownChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', top: '5%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', max: 3 },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.dimension),
        axisLabel: { fontSize: 12 },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => ({
            value: d.score,
            itemStyle: { color: DIMENSION_COLORS[d.dimension] || '#8b5cf6', borderRadius: [0, 4, 4, 0] },
          })),
          barWidth: 20,
          label: {
            show: true,
            position: 'right',
            formatter: '{c}分',
            fontSize: 12,
          },
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

  return <div ref={chartRef} className="w-full h-48" />;
}
