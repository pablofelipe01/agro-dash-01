'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/app/store/useAppStore';
import StatsPanel from '@/app/components/Stats/StatsPanel';
import ModoToggle from '@/app/components/UI/ModoToggle';
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
    lotesDefinidos,
    isLoading,
    error,
    refetchAll,
    clearError,
  } = useAppStore();

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  const handleRefresh = () => {
    clearError();
    refetchAll();
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
                Gestion de Fincas y Cultivos
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Toggle de Modo */}
              <ModoToggle />

              {/* Boton Actualizar Datos */}
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
                {isLoading ? 'Cargando...' : 'Actualizar Datos'}
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

        {isLoading && lotesDefinidos.length === 0 ? (
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
          Agro Sirius Dashboard - Sistema de Gestion de Fincas y Cultivos
        </div>
      </footer>
    </div>
  );
}
