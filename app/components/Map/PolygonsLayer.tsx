'use client';

import { Polygon, Popup } from 'react-leaflet';
import { LoteDefinido } from '@/app/lib/types';
import { CULTIVOS_CONFIG } from '@/app/lib/constants';
import { formatDate } from '@/app/lib/utils';

interface PolygonsLayerProps {
  lotes: LoteDefinido[];
}

export default function PolygonsLayer({ lotes }: PolygonsLayerProps) {
  return (
    <>
      {lotes.map((lote, index) => {
        const emoji = CULTIVOS_CONFIG[lote.cultivo]?.emoji || '🌱';

        return (
          <Polygon
            key={`${lote.lote}-${lote.sector}-${index}`}
            positions={lote.polygonCoords}
            pathOptions={{
              color: lote.color,
              fillColor: lote.color,
              fillOpacity: 0.5,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-4xl">{emoji}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      {lote.lote} - {lote.sector}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Cultivo:</span> {lote.cultivo}
                  </p>
                  <p>
                    <span className="font-medium">Variedad:</span> {lote.variedad}
                  </p>
                  <p>
                    <span className="font-medium">Hectareas:</span>{' '}
                    {lote.hectareas.toFixed(2)} ha
                  </p>
                  <p>
                    <span className="font-medium">Creado:</span>{' '}
                    {formatDate(lote.createdAt)}
                  </p>
                </div>
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}
