'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/app/store/useAppStore';
import {
  getLotesVacios,
  getLotesSembrados,
  groupLotesByCultivo,
  formatLoteNombre,
  agruparPorLote,
} from '@/app/lib/utils';
import CultivosPieChart from './CultivosPieChart';

export default function StatsPanel() {
  const { lotesDefinidos, lotesPintados, modoEdicion } = useAppStore();

  const lotesSembrados = useMemo(() => getLotesSembrados(lotesPintados), [lotesPintados]);
  const lotesVacios = useMemo(() => getLotesVacios(lotesPintados), [lotesPintados]);

  // Total de hectareas de TODOS los lotes (calculado del poligono)
  const totalHectareas = useMemo(() => {
    return lotesPintados.reduce((sum, l) => sum + l.hectareasTotales, 0);
  }, [lotesPintados]);

  // Hectareas solo de lotes sembrados
  const hectareasSembradas = useMemo(() => {
    return lotesSembrados.reduce((sum, l) => sum + l.hectareasTotales, 0);
  }, [lotesSembrados]);

  const cultivoData = useMemo(() => groupLotesByCultivo(lotesPintados), [lotesPintados]);

  // Agrupar por Lote (unidad grande) con sus sectores
  const lotesAgrupados = useMemo(() => agruparPorLote(lotesPintados), [lotesPintados]);

  // Contar lotes unicos
  const lotesUnicos = useMemo(() => {
    const unicos = new Set(lotesPintados.map((l) => l.lote));
    return unicos.size;
  }, [lotesPintados]);

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
      {/* Resumen General */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{lotesUnicos}</p>
          <p className="text-sm text-gray-600">Lotes</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{lotesPintados.length}</p>
          <p className="text-sm text-gray-600">Sectores</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{lotesSembrados.length}</p>
          <p className="text-sm text-gray-600">Sembrados</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className={`font-bold text-orange-600 ${totalHectareas >= 1000 ? 'text-xl' : totalHectareas >= 100 ? 'text-2xl' : 'text-3xl'}`}>
            {totalHectareas >= 1000
              ? `${(totalHectareas / 1000).toFixed(1)}k`
              : totalHectareas.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">Hectareas Totales</p>
        </div>
      </div>

      {/* Instrucciones segun modo */}
      <div className={`rounded-lg p-4 ${modoEdicion ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
        {modoEdicion ? (
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">📍 Pasos para construir tu finca:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Ingresa las coordenadas del centro de tu finca</li>
              <li>Dibuja los lotes usando las herramientas del mapa</li>
              <li>Guarda cada lote con su nombre (Lote X, Sector Y)</li>
            </ol>
          </div>
        ) : (
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">📊 Visualizando cultivos sembrados</p>
            <p className="text-green-700">
              Los datos provienen de registros de la app movil mesh.
              Cambia a modo Construccion para agregar mas lotes.
            </p>
          </div>
        )}
      </div>

      {/* Resumen por Lote (unidad grande) */}
      {lotesAgrupados.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📐 Hectareas por Lote
          </h3>
          <div className="space-y-3">
            {lotesAgrupados.map((lote) => (
              <div
                key={lote.lote}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{lote.lote}</span>
                  <span className="text-lg font-bold text-orange-600">
                    {lote.hectareasTotales.toFixed(2)} ha
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {lote.cantidadSectores} sector{lote.cantidadSectores !== 1 ? 'es' : ''}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {lote.sectores.map((sector) => (
                    <div
                      key={`${lote.lote}-${sector.sector}`}
                      className={`text-xs px-2 py-1 rounded ${
                        sector.cultivo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span className="font-medium">{sector.sector}:</span>{' '}
                      {sector.hectareasPoligono.toFixed(2)} ha
                      {sector.cultivo && (
                        <span className="ml-1">({sector.cultivo})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grafico Pie: Cultivos */}
      {lotesSembrados.length > 0 && <CultivosPieChart data={cultivoData} />}

      {/* Lista de lotes vacios */}
      {lotesVacios.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🌱 Sectores sin Cultivo ({lotesVacios.length})
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Estos sectores estan definidos pero aun no tienen siembra registrada
          </p>
          <div className="space-y-2">
            {lotesVacios.map((lote, index) => (
              <div
                key={`${lote.lote}-${lote.sector}-${index}`}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
              >
                <span className="text-sm text-gray-700">
                  {formatLoteNombre(lote.lote, lote.sector)}
                </span>
                <span className="text-xs text-gray-500">
                  {lote.hectareasTotales.toFixed(2)} ha
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje si no hay lotes */}
      {lotesDefinidos.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <span className="text-4xl block mb-2">🗺️</span>
          <p className="text-yellow-800 font-medium">No hay lotes definidos</p>
          <p className="text-yellow-700 text-sm mt-1">
            Cambia a modo Construccion para dibujar tu finca
          </p>
        </div>
      )}
    </div>
  );
}
