// Zustand Store para Agro Sirius Dashboard
// Estado global con modos de edicion y visualizacion

import { create } from 'zustand';
import { AppStore } from '@/app/lib/types';

export const useAppStore = create<AppStore>((set, get) => ({
  // Estado inicial
  registros: [],
  lotesDefinidos: [],
  lotesPintados: [],
  isLoading: false,
  error: null,
  modoEdicion: true, // Inicia en modo construccion
  coordenadasBase: null,

  // Acciones
  fetchRegistros: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/sheets/registros');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al obtener registros');
      }

      set({ registros: data.data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchLotes: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/sheets/lotes');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al obtener lotes');
      }

      set({
        lotesDefinidos: data.data.lotesDefinidos,
        lotesPintados: data.data.lotesPintados,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addLote: async (loteData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/sheets/lotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loteData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al guardar lote');
      }

      // Refetch para obtener datos actualizados
      await get().fetchLotes();

      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setCoordenadaBase: (coords) => {
    set({ coordenadasBase: coords });
  },

  toggleModoEdicion: () => {
    set((state) => ({ modoEdicion: !state.modoEdicion }));
  },

  refetchAll: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fetch registros y lotes en paralelo
      const [registrosRes, lotesRes] = await Promise.all([
        fetch('/api/sheets/registros'),
        fetch('/api/sheets/lotes'),
      ]);

      const registrosData = await registrosRes.json();
      const lotesData = await lotesRes.json();

      if (!registrosData.success) {
        throw new Error(registrosData.error || 'Error al obtener registros');
      }

      if (!lotesData.success) {
        throw new Error(lotesData.error || 'Error al obtener lotes');
      }

      set({
        registros: registrosData.data,
        lotesDefinidos: lotesData.data.lotesDefinidos,
        lotesPintados: lotesData.data.lotesPintados,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearFinca: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/sheets/lotes', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al borrar finca');
      }

      // Limpiar estado local
      set({
        lotesDefinidos: [],
        lotesPintados: [],
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
}));
