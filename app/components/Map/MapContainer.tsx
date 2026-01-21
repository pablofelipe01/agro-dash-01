'use client';

import { useState, useRef, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { useAppStore } from '@/app/store/useAppStore';
import { MAPA_CONFIG } from '@/app/lib/constants';
import PolygonsLayer from './PolygonsLayer';
import DrawControls from './DrawControls';
import MapLegend from './MapLegend';
import CoordenadasBaseInput from './CoordenadasBaseInput';
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

// Componente para centrar el mapa
function MapCenterController({ center, zoom }: { center: [number, number] | null; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapContainer() {
  const { lotesPintados, modoEdicion, coordenadasBase } = useAppStore();
  const [drawnPolygon, setDrawnPolygon] = useState<[number, number][] | null>(null);
  const [showLoteForm, setShowLoteForm] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

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

  const handleCentrarMapa = (coords: [number, number]) => {
    setMapCenter(coords);
  };

  const initialCenter = coordenadasBase || MAPA_CONFIG.center;

  return (
    <div className="relative w-full h-full">
      {/* Banner de modo */}
      <div
        className={`absolute top-0 left-0 right-0 z-[1000] py-2 px-4 text-center text-sm font-medium ${
          modoEdicion
            ? 'bg-blue-600 text-white'
            : 'bg-green-600 text-white'
        }`}
      >
        {modoEdicion ? (
          <span>🏗️ Modo Construccion: Dibuja los lotes de tu finca</span>
        ) : (
          <span>👁️ Modo Visualizacion: Viendo cultivos sembrados</span>
        )}
      </div>

      <LeafletMapContainer
        center={initialCenter}
        zoom={MAPA_CONFIG.zoom}
        maxZoom={MAPA_CONFIG.maxZoom}
        minZoom={MAPA_CONFIG.minZoom}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px', paddingTop: '40px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Controlador de centro */}
        <MapCenterController center={mapCenter} zoom={15} />

        {/* Capa de poligonos - siempre visible */}
        <PolygonsLayer lotesPintados={lotesPintados} />

        {/* Controles de dibujo - solo en modo edicion */}
        {modoEdicion && <DrawControls onPolygonDrawn={handlePolygonDrawn} />}
      </LeafletMapContainer>

      {/* Input de coordenadas - solo en modo edicion */}
      {modoEdicion && (
        <CoordenadasBaseInput onCentrar={handleCentrarMapa} />
      )}

      {/* Leyenda */}
      <MapLegend />

      {/* Formulario de lote */}
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
