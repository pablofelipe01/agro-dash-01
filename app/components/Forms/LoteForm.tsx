'use client';

import { useState } from 'react';
import { useAppStore } from '@/app/store/useAppStore';
import {
  LOTES_OPTIONS,
  SECTORES_OPTIONS,
  CULTIVOS_OPTIONS,
  VARIEDADES_POR_CULTIVO,
  CULTIVOS_CONFIG,
} from '@/app/lib/constants';

interface LoteFormProps {
  polygonCoords: [number, number][];
  onSave: () => void;
  onCancel: () => void;
}

export default function LoteForm({ polygonCoords, onSave, onCancel }: LoteFormProps) {
  const { addLote, isLoading } = useAppStore();

  const [formData, setFormData] = useState({
    lote: '',
    sector: '',
    cultivo: '',
    variedad: '',
    hectareas: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const variedades = formData.cultivo
    ? VARIEDADES_POR_CULTIVO[formData.cultivo] || []
    : [];

  const cultivoConfig = formData.cultivo
    ? CULTIVOS_CONFIG[formData.cultivo]
    : null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Si cambia el cultivo, resetear la variedad
      if (field === 'cultivo') {
        newData.variedad = '';
      }

      return newData;
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.lote) {
      setError('Selecciona un lote');
      return;
    }
    if (!formData.sector) {
      setError('Selecciona un sector');
      return;
    }
    if (!formData.cultivo) {
      setError('Selecciona un cultivo');
      return;
    }
    if (!formData.variedad) {
      setError('Selecciona una variedad');
      return;
    }

    const hectareas = parseFloat(formData.hectareas);
    if (isNaN(hectareas) || hectareas <= 0) {
      setError('Ingresa un numero de hectareas valido');
      return;
    }

    if (polygonCoords.length < 3) {
      setError('El poligono debe tener al menos 3 puntos');
      return;
    }

    try {
      await addLote({
        lote: formData.lote,
        sector: formData.sector,
        cultivo: formData.cultivo,
        variedad: formData.variedad,
        hectareas,
        polygonCoords,
        color: cultivoConfig?.color || '#999999',
      });

      setSuccess(true);
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el lote');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          {cultivoConfig && <span className="text-2xl">{cultivoConfig.emoji}</span>}
          Definir Nuevo Lote
        </h2>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <span className="text-4xl mb-2 block">✅</span>
            <p className="text-green-800 font-medium">Lote guardado exitosamente</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lote
              </label>
              <select
                value={formData.lote}
                onChange={(e) => handleChange('lote', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar lote...</option>
                {LOTES_OPTIONS.map((lote) => (
                  <option key={lote} value={lote}>
                    {lote}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => handleChange('sector', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar sector...</option>
                {SECTORES_OPTIONS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cultivo
              </label>
              <select
                value={formData.cultivo}
                onChange={(e) => handleChange('cultivo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar cultivo...</option>
                {CULTIVOS_OPTIONS.map((cultivo) => (
                  <option key={cultivo} value={cultivo}>
                    {CULTIVOS_CONFIG[cultivo]?.emoji} {cultivo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variedad
              </label>
              <select
                value={formData.variedad}
                onChange={(e) => handleChange('variedad', e.target.value)}
                disabled={!formData.cultivo}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {formData.cultivo
                    ? 'Seleccionar variedad...'
                    : 'Primero selecciona un cultivo'}
                </option>
                {variedades.map((variedad) => (
                  <option key={variedad} value={variedad}>
                    {variedad}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hectareas
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.hectareas}
                onChange={(e) => handleChange('hectareas', e.target.value)}
                placeholder="Ej: 5.50"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {cultivoConfig && (
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                <span className="text-3xl">{cultivoConfig.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Preview</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: cultivoConfig.color }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      Color del poligono
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Guardando...' : 'Guardar Lote'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
