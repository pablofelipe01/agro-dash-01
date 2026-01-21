'use client';

import { useRef } from 'react';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

interface DrawControlsProps {
  onPolygonDrawn: (coords: [number, number][]) => void;
}

export default function DrawControls({ onPolygonDrawn }: DrawControlsProps) {
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  const handleCreated = (e: L.DrawEvents.Created) => {
    const { layer } = e;

    if (layer instanceof L.Polygon) {
      const latLngs = layer.getLatLngs()[0] as L.LatLng[];
      const coords: [number, number][] = latLngs.map((latLng) => [
        latLng.lat,
        latLng.lng,
      ]);

      onPolygonDrawn(coords);

      // Limpiar la capa despues de capturar las coordenadas
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
      }
    }
  };

  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topright"
        onCreated={handleCreated}
        draw={{
          polygon: {
            allowIntersection: false,
            drawError: {
              color: '#e1e100',
              message: '<strong>Error:</strong> Los bordes no pueden cruzarse',
            },
            shapeOptions: {
              color: '#22c55e',
              fillColor: '#22c55e',
              fillOpacity: 0.3,
            },
          },
          rectangle: {
            shapeOptions: {
              color: '#22c55e',
              fillColor: '#22c55e',
              fillOpacity: 0.3,
            },
          },
          polyline: false,
          circle: false,
          marker: false,
          circlemarker: false,
        }}
        edit={{
          edit: false,
          remove: false,
        }}
      />
    </FeatureGroup>
  );
}
