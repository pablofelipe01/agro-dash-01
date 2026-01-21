'use client';

import { useState, useMemo } from 'react';
import { RegistroSiembra } from '@/app/lib/types';
import {
  getUniqueNodos,
  getRegistrosByNodo,
  calculateTotalHectareas,
  calculatePercentage,
  groupByCultivo,
} from '@/app/lib/utils';

interface UserStatsProps {
  registros: RegistroSiembra[];
}

export default function UserStats({ registros }: UserStatsProps) {
  const nodos = useMemo(() => getUniqueNodos(registros), [registros]);
  const [selectedNodo, setSelectedNodo] = useState<string>('');

  const totalGeneral = useMemo(
    () => calculateTotalHectareas(registros),
    [registros]
  );

  const nodoStats = useMemo(() => {
    if (!selectedNodo) return null;

    const nodoRegistros = getRegistrosByNodo(registros, selectedNodo);
    const totalNodo = calculateTotalHectareas(nodoRegistros);
    const cultivoBreakdown = groupByCultivo(nodoRegistros);

    return {
      total: totalNodo,
      percentage: calculatePercentage(totalNodo, totalGeneral),
      registrosCount: nodoRegistros.length,
      cultivoBreakdown,
    };
  }, [selectedNodo, registros, totalGeneral]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Estadisticas por Nodo
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seleccionar Nodo
        </label>
        <select
          value={selectedNodo}
          onChange={(e) => setSelectedNodo(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Seleccionar nodo...</option>
          {nodos.map((nodo) => (
            <option key={nodo} value={nodo}>
              {nodo}
            </option>
          ))}
        </select>
      </div>

      {selectedNodo && nodoStats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                {nodoStats.total.toFixed(2)}
              </p>
              <p className="text-xs text-green-600">Hectareas</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {nodoStats.percentage}
              </p>
              <p className="text-xs text-blue-600">del Total</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Desglose por Cultivo
            </p>
            {nodoStats.cultivoBreakdown.length > 0 ? (
              <div className="space-y-2">
                {nodoStats.cultivoBreakdown.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.emoji}</span>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        {item.value.toFixed(2)} ha
                      </span>
                      <span className="text-xs text-gray-500">
                        ({calculatePercentage(item.value, nodoStats.total)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin cultivos registrados</p>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            Total de registros: {nodoStats.registrosCount}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>Selecciona un nodo para ver sus estadisticas</p>
        </div>
      )}
    </div>
  );
}
