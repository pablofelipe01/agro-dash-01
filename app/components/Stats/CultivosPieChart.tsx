'use client';

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ChartData } from '@/app/lib/types';

interface CultivosPieChartProps {
  data: ChartData[];
}

const COLORS = ['#8B4513', '#6F4E37', '#FF8C00', '#22c55e', '#3b82f6', '#ef4444', '#f59e0b'];

export default function CultivosPieChart({ data }: CultivosPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Distribucion por Cultivo
      </h3>
      <div className="flex justify-center">
        <PieChart width={320} height={320}>
          <Pie
            data={data}
            cx={160}
            cy={140}
            innerRadius={50}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={true}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              const numValue = typeof value === 'number' ? value : 0;
              return [`${numValue.toFixed(2)} ha`, 'Hectáreas'];
            }}
          />
          <Legend
            verticalAlign="bottom"
            formatter={(value: string) => {
              const item = data.find((d) => d.name === value);
              const percent = item ? ((item.value / total) * 100).toFixed(0) : 0;
              return `${item?.emoji || ''} ${value} (${percent}%)`;
            }}
          />
        </PieChart>
      </div>
    </div>
  );
}
