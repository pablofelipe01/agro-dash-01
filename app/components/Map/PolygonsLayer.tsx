'use client';

import { Polygon, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { LotePintado } from '@/app/lib/types';
import { formatDate, calculatePolygonCenter, formatLoteNombre } from '@/app/lib/utils';

interface PolygonsLayerProps {
  lotesPintados: LotePintado[];
}

// Crear icono de emoji para el centro del poligono
function createEmojiIcon(emoji: string, size: 'large' | 'small' = 'large') {
  const fontSize = size === 'large' ? '48px' : '24px';
  return L.divIcon({
    html: `<div style="font-size: ${fontSize}; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${emoji}</div>`,
    className: 'emoji-center-marker',
    iconSize: size === 'large' ? [60, 60] : [30, 30],
    iconAnchor: size === 'large' ? [30, 30] : [15, 15],
  });
}

export default function PolygonsLayer({ lotesPintados }: PolygonsLayerProps) {
  return (
    <>
      {lotesPintados.map((lote, index) => {
        const center = calculatePolygonCenter(lote.polygonCoords);
        const tieneCultivo = lote.cultivo !== null;

        return (
          <div key={`${lote.lote}-${lote.sector}-${index}`}>
            {/* Poligono del lote */}
            <Polygon
              positions={lote.polygonCoords}
              pathOptions={{
                color: tieneCultivo ? lote.color : '#9CA3AF',
                fillColor: tieneCultivo ? lote.color : '#E5E7EB',
                fillOpacity: tieneCultivo ? 0.6 : 0.3,
                weight: tieneCultivo ? 3 : 2,
                dashArray: tieneCultivo ? undefined : '5, 5',
              }}
            >
              <Popup>
                <div className="p-2 min-w-[220px]">
                  {tieneCultivo ? (
                    <>
                      {/* Lote CON cultivo */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-5xl">{lote.emoji}</span>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">
                            {formatLoteNombre(lote.lote, lote.sector)}
                          </p>
                          <p className="text-sm text-gray-600">{lote.cultivo}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm border-t pt-2">
                        <p>
                          <span className="font-medium">Variedad:</span> {lote.variedad}
                        </p>
                        <p>
                          <span className="font-medium">Registros:</span> {lote.cantidadRegistros}
                        </p>
                        <p>
                          <span className="font-medium">Area:</span>{' '}
                          {lote.hectareasTotales.toFixed(2)} ha (calculado)
                        </p>
                        {lote.ultimoRegistro && (
                          <p className="text-xs text-gray-500">
                            Ultimo: {formatDate(lote.ultimoRegistro)}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Lote SIN cultivo */}
                      <div className="text-center">
                        <span className="text-4xl block mb-2">🌱</span>
                        <p className="font-bold text-gray-800">
                          {formatLoteNombre(lote.lote, lote.sector)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {lote.hectareasTotales.toFixed(2)} ha
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Sin cultivo asignado
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Registra siembra desde la app movil
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Popup>
            </Polygon>

            {/* Emoji en el centro del poligono (solo si tiene cultivo) */}
            {tieneCultivo && lote.emoji && center[0] !== 0 && (
              <Marker
                position={center}
                icon={createEmojiIcon(lote.emoji, 'large')}
                interactive={false}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
