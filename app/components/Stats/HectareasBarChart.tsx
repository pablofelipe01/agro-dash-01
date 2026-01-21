'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { ChartData } from '@/app/lib/types';

interface HectareasBarChartProps {
  data: ChartData[];
}

export default function HectareasBarChart({ data }: HectareasBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Hectareas por Lote
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Hectareas',
              angle: -90,
              position: 'insideLeft',
              fontSize: 12,
            }}
          />
          <Tooltip
            formatter={(value) => {
              const numValue = typeof value === 'number' ? value : 0;
              return [`${numValue.toFixed(2)} ha`, 'Hectareas'];
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar
            dataKey="value"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
