'use client';

import { useState, useMemo } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import { useAppStore } from '@/app/store/useAppStore';
import { MAPA_CONFIG } from '@/app/lib/constants';
import { filterRegistros } from '@/app/lib/utils';
import PointsLayer from './PointsLayer';
import PolygonsLayer from './PolygonsLayer';
import DrawControls from './DrawControls';
import MapLegend from './MapLegend';
import LoteForm from '../Forms/LoteForm';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix para iconos de Leaflet en Next.js
import L from 'leaflet';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapContainer() {
  const { registros, lotes, selectedCultivo, selectedNodo } = useAppStore();
  const [drawnPolygon, setDrawnPolygon] = useState<[number, number][] | null>(null);
  const [showLoteForm, setShowLoteForm] = useState(false);

  const filteredRegistros = useMemo(() => {
    return filterRegistros(registros, selectedCultivo, selectedNodo);
  }, [registros, selectedCultivo, selectedNodo]);

  const handlePolygonDrawn = (coords: [number, number][]) => {
    setDrawnPolygon(coords);
    setShowLoteForm(true);
  };

  const handleLoteSaved = () => {
    setShowLoteForm(false);
    setDrawnPolygon(null);
  };

  const handleFormCancel = () => {
    setShowLoteForm(false);
    setDrawnPolygon(null);
  };

  return (
    <div className="relative w-full h-full">
      <LeafletMapContainer
        center={MAPA_CONFIG.center}
        zoom={MAPA_CONFIG.zoom}
        maxZoom={MAPA_CONFIG.maxZoom}
        minZoom={MAPA_CONFIG.minZoom}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <PointsLayer registros={filteredRegistros} />
        <PolygonsLayer lotes={lotes} />
        <DrawControls onPolygonDrawn={handlePolygonDrawn} />
      </LeafletMapContainer>

      <MapLegend />

      {showLoteForm && drawnPolygon && (
        <LoteForm
          polygonCoords={drawnPolygon}
          onSave={handleLoteSaved}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
