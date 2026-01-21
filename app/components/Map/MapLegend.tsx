'use client';

import { CULTIVOS_CONFIG } from '@/app/lib/constants';

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
      <h4 className="font-bold text-gray-800 mb-2 text-sm">Leyenda</h4>
      <div className="space-y-1">
        {Object.entries(CULTIVOS_CONFIG).map(([name, config]) => (
          <div key={name} className="flex items-center gap-2 text-sm">
            <span className="text-lg">{config.emoji}</span>
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: config.color }}
            ></div>
            <span className="text-gray-700">{name}</span>
          </div>
        ))}
      </div>
      <hr className="my-2" />
      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <span>Puntos GPS individuales</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <span>Poligonos definidos</span>
        </div>
      </div>
    </div>
  );
}
