'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/app/store/useAppStore';
import {
  calculateTotalHectareas,
  groupByCultivo,
  groupByLote,
  groupByDate,
  getUniqueCultivos,
  formatDateShort,
  filterRegistros,
} from '@/app/lib/utils';
import CultivosPieChart from './CultivosPieChart';
import HectareasBarChart from './HectareasBarChart';
import TimelineChart from './TimelineChart';
import UserStats from './UserStats';

export default function StatsPanel() {
  const { registros, selectedCultivo, selectedNodo } = useAppStore();

  const filteredRegistros = useMemo(() => {
    return filterRegistros(registros, selectedCultivo, selectedNodo);
  }, [registros, selectedCultivo, selectedNodo]);

  const totalRegistros = filteredRegistros.length;
  const totalHectareas = useMemo(
    () => calculateTotalHectareas(filteredRegistros),
    [filteredRegistros]
  );
  const cultivosCount = useMemo(
    () => getUniqueCultivos(filteredRegistros).length,
    [filteredRegistros]
  );

  const ultimoRegistro = useMemo(() => {
    if (filteredRegistros.length === 0) return 'N/A';
    const sorted = [...filteredRegistros].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return formatDateShort(sorted[0].timestamp);
  }, [filteredRegistros]);

  const cultivoData = useMemo(
    () => groupByCultivo(filteredRegistros),
    [filteredRegistros]
  );
  const loteData = useMemo(
    () => groupByLote(filteredRegistros),
    [filteredRegistros]
  );
  const timelineData = useMemo(
    () => groupByDate(filteredRegistros),
    [filteredRegistros]
  );

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
      {/* Resumen General */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{totalRegistros}</p>
          <p className="text-sm text-gray-600">Total Registros</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {totalHectareas.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Hectareas Sembradas</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{cultivosCount}</p>
          <p className="text-sm text-gray-600">Tipos de Cultivo</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-lg font-bold text-blue-600">{ultimoRegistro}</p>
          <p className="text-sm text-gray-600">Ultimo Registro</p>
        </div>
      </div>

      {/* Gráfico Pie: Cultivos */}
      <CultivosPieChart data={cultivoData} />

      {/* Gráfico Bar: Hectáreas por Lote */}
      <HectareasBarChart data={loteData} />

      {/* Gráfico Timeline */}
      <TimelineChart data={timelineData} />

      {/* Estadísticas por Usuario/Nodo */}
      <UserStats registros={filteredRegistros} />
    </div>
  );
}
