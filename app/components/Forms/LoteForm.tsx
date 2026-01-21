'use client';

import { useState } from 'react';
import { useAppStore } from '@/app/store/useAppStore';
import { LOTES_OPTIONS, SECTORES_OPTIONS } from '@/app/lib/constants';

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
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    if (polygonCoords.length < 3) {
      setError('El poligono debe tener al menos 3 puntos');
      return;
    }

    try {
      await addLote({
        lote: formData.lote,
        sector: formData.sector,
        polygonCoords,
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
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          🗺️ Definir Nuevo Lote
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Define la estructura de tu finca. Los cultivos se asignaran desde la app movil.
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <span className="text-4xl mb-2 block">✅</span>
            <p className="text-green-800 font-medium">Lote guardado exitosamente</p>
            <p className="text-green-600 text-sm mt-1">
              {formData.lote} - {formData.sector}
            </p>
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar sector...</option>
                {SECTORES_OPTIONS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Poligono:</span> {polygonCoords.length} puntos
              </p>
              <p className="text-xs text-gray-500 mt-1">
                El cultivo se asignara cuando registres siembra desde la app movil
              </p>
            </div>

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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
