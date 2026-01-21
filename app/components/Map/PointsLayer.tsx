'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { RegistroSiembra } from '@/app/lib/types';
import { CULTIVOS_CONFIG } from '@/app/lib/constants';
import { formatDate, isValidGPS } from '@/app/lib/utils';

interface PointsLayerProps {
  registros: RegistroSiembra[];
}

function createEmojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size: 24px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${emoji}</div>`,
    className: 'emoji-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function PointsLayer({ registros }: PointsLayerProps) {
  const validRegistros = registros.filter((r) =>
    isValidGPS(r.gpsLat, r.gpsLon)
  );

  return (
    <>
      {validRegistros.map((registro) => {
        const emoji = CULTIVOS_CONFIG[registro.cultivo]?.emoji || '🌱';
        const icon = createEmojiIcon(emoji);

        return (
          <Marker
            key={registro.id}
            position={[registro.gpsLat!, registro.gpsLon!]}
            icon={icon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-bold text-gray-800">{registro.cultivo}</p>
                    <p className="text-sm text-gray-600">{registro.variedad}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Lote:</span> {registro.lote}
                  </p>
                  <p>
                    <span className="font-medium">Sector:</span> {registro.sector}
                  </p>
                  <p>
                    <span className="font-medium">Hectareas:</span>{' '}
                    {registro.hectareas.toFixed(2)} ha
                  </p>
                  <p>
                    <span className="font-medium">Fecha:</span>{' '}
                    {formatDate(registro.timestamp)}
                  </p>
                  {registro.notas && (
                    <p className="text-gray-500 italic">
                      <span className="font-medium">Notas:</span> {registro.notas}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
