'use client';

import { useState } from 'react';
import { useAppStore } from '@/app/store/useAppStore';
import { isValidCoordinates } from '@/app/lib/utils';

interface CoordenadasBaseInputProps {
  onCentrar: (coords: [number, number]) => void;
}

export default function CoordenadasBaseInput({ onCentrar }: CoordenadasBaseInputProps) {
  const { coordenadasBase, setCoordenadaBase } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lat, setLat] = useState(coordenadasBase?.[0]?.toString() || '');
  const [lon, setLon] = useState(coordenadasBase?.[1]?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setError('Ingresa coordenadas validas');
      return;
    }

    if (!isValidCoordinates(latNum, lonNum)) {
      setError('Latitud debe estar entre -90 y 90, longitud entre -180 y 180');
      return;
    }

    const coords: [number, number] = [latNum, lonNum];
    setCoordenadaBase(coords);
    onCentrar(coords);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="absolute top-4 left-4 z-[1000] bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span>📍</span>
        <span className="text-sm">Coordenadas</span>
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <span>📍</span>
          Centro de la Finca
        </h4>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Latitud
          </label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Ej: 4.7277783"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Longitud
          </label>
          <input
            type="number"
            step="any"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="Ej: -74.07215"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-600 text-xs">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Centrar Mapa
        </button>
      </form>

      <p className="mt-3 text-xs text-gray-500">
        Ingresa las coordenadas del centro de tu finca para posicionar el mapa.
      </p>
    </div>
  );
}
