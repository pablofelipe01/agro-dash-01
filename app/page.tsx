'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/app/store/useAppStore';
import { getUniqueCultivos, getUniqueNodos } from '@/app/lib/utils';
import StatsPanel from '@/app/components/Stats/StatsPanel';
import LoadingSpinner from '@/app/components/UI/LoadingSpinner';
import ErrorMessage from '@/app/components/UI/ErrorMessage';

// Dynamic import del mapa para evitar SSR issues con Leaflet
const MapContainer = dynamic(
  () => import('@/app/components/Map/MapContainer'),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Cargando mapa..." />,
  }
);

export default function HomePage() {
  const {
    registros,
    isLoading,
    error,
    selectedCultivo,
    selectedNodo,
    fetchRegistros,
    fetchLotes,
    setFilter,
    clearError,
  } = useAppStore();

  const cultivos = useMemo(() => getUniqueCultivos(registros), [registros]);
  const nodos = useMemo(() => getUniqueNodos(registros), [registros]);

  useEffect(() => {
    fetchRegistros();
    fetchLotes();
  }, [fetchRegistros, fetchLotes]);

  const handleRefresh = () => {
    clearError();
    fetchRegistros();
    fetchLotes();
  };

  const handleClearFilters = () => {
    setFilter(null, null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-3xl">🌾</span>
                Agro Sirius Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Gestion de Siembras en Tiempo Real
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filtro por Cultivo */}
              <select
                value={selectedCultivo || ''}
                onChange={(e) => setFilter(e.target.value || null, undefined)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos los cultivos</option>
                {cultivos.map((cultivo) => (
                  <option key={cultivo} value={cultivo}>
                    {cultivo}
                  </option>
                ))}
              </select>

              {/* Filtro por Nodo */}
              <select
                value={selectedNodo || ''}
                onChange={(e) => setFilter(undefined, e.target.value || null)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos los nodos</option>
                {nodos.map((nodo) => (
                  <option key={nodo} value={nodo}>
                    {nodo}
                  </option>
                ))}
              </select>

              {/* Limpiar filtros */}
              {(selectedCultivo || selectedNodo) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Limpiar filtros
                </button>
              )}

              {/* Boton Actualizar */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {isLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onRetry={handleRefresh} />
          </div>
        )}

        {isLoading && registros.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner message="Cargando datos del dashboard..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Mapa - 60% */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow overflow-hidden h-[50vh] lg:h-[calc(100vh-180px)]">
                <MapContainer />
              </div>
            </div>

            {/* Stats Panel - 40% */}
            <div className="lg:col-span-2">
              <StatsPanel />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center text-sm text-gray-500">
          Agro Sirius Dashboard - Sistema de Gestion de Siembras
        </div>
      </footer>
    </div>
  );
}
