'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface RadarData {
  dimension: string;
  score: number;
}

interface Props {
  data: RadarData[];
}

export function RadarChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const option = {
      radar: {
        indicator: data.map((d) => ({
          name: d.dimension,
          max: 3,
        })),
        shape: 'polygon',
        splitNumber: 3,
        axisName: { color: '#666' },
        splitLine: { lineStyle: { color: '#e5e7eb' } },
        splitArea: { areaStyle: { color: ['#fff', '#f9fafb'] } },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: data.map((d) => d.score),
              name: '五维分析',
              areaStyle: { color: 'rgba(139, 92, 246, 0.2)' },
              lineStyle: { color: '#8b5cf6', width: 2 },
              itemStyle: { color: '#8b5cf6' },
            },
          ],
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
