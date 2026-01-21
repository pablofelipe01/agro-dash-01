// Zustand Store para Agro Sirius Dashboard

import { create } from 'zustand';
import { AppStore } from '@/app/lib/types';

export const useAppStore = create<AppStore>((set, get) => ({
  // Estado inicial
  registros: [],
  lotes: [],
  isLoading: false,
  error: null,
  selectedCultivo: null,
  selectedNodo: null,

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

      set({ lotes: data.data, isLoading: false });
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

      // Agregar el nuevo lote al estado
      const currentLotes = get().lotes;
      set({
        lotes: [...currentLotes, data.data],
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setFilter: (cultivo, nodo) => {
    set({
      selectedCultivo: cultivo !== undefined ? cultivo : get().selectedCultivo,
      selectedNodo: nodo !== undefined ? nodo : get().selectedNodo,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
