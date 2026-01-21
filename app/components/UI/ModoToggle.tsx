'use client';

import { useAppStore } from '@/app/store/useAppStore';

export default function ModoToggle() {
  const { modoEdicion, toggleModoEdicion } = useAppStore();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleModoEdicion}
        className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
          modoEdicion ? 'bg-blue-600' : 'bg-green-600'
        }`}
        title={modoEdicion ? 'Modo Construccion' : 'Modo Visualizacion'}
      >
        <span
          className="inline-flex h-8 w-8 transform items-center justify-center rounded-full bg-white text-xl shadow-sm transition-transform"
          style={{
            transform: modoEdicion ? 'translateX(0.25rem)' : 'translateX(2.75rem)',
          }}
        >
          {modoEdicion ? '🏗️' : '👁️'}
        </span>
      </button>
    </div>
  );
}
