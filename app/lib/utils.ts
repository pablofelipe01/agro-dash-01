// Utilidades para Agro Sirius Dashboard

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { RegistroSiembra, ChartData } from './types';
import { CULTIVOS_CONFIG } from './constants';

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es });
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: es });
  } catch {
    return dateString;
  }
}

export function calculateTotalHectareas(registros: RegistroSiembra[]): number {
  return registros.reduce((total, registro) => total + (registro.hectareas || 0), 0);
}

export function groupByCultivo(registros: RegistroSiembra[]): ChartData[] {
  const grouped = registros.reduce((acc, registro) => {
    const cultivo = registro.cultivo || 'Sin clasificar';
    if (!acc[cultivo]) {
      acc[cultivo] = 0;
    }
    acc[cultivo] += registro.hectareas || 0;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
    color: CULTIVOS_CONFIG[name]?.color || '#999999',
    emoji: CULTIVOS_CONFIG[name]?.emoji || '🌱',
  }));
}

export function groupByLote(registros: RegistroSiembra[]): ChartData[] {
  const grouped = registros.reduce((acc, registro) => {
    const lote = registro.lote || 'Sin lote';
    if (!acc[lote]) {
      acc[lote] = 0;
    }
    acc[lote] += registro.hectareas || 0;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }))
    .sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
}

export function getUniqueNodos(registros: RegistroSiembra[]): string[] {
  const nodos = new Set(registros.map((r) => r.nodo).filter(Boolean));
  return Array.from(nodos).sort();
}

export function getUniqueCultivos(registros: RegistroSiembra[]): string[] {
  const cultivos = new Set(registros.map((r) => r.cultivo).filter(Boolean));
  return Array.from(cultivos).sort();
}

export function calculatePercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function isValidGPS(lat: number | null, lon: number | null): boolean {
  if (lat === null || lon === null) return false;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

export function filterRegistros(
  registros: RegistroSiembra[],
  cultivo: string | null,
  nodo: string | null
): RegistroSiembra[] {
  return registros.filter((registro) => {
    if (cultivo && registro.cultivo !== cultivo) return false;
    if (nodo && registro.nodo !== nodo) return false;
    return true;
  });
}

export function getRegistrosByNodo(
  registros: RegistroSiembra[],
  nodo: string
): RegistroSiembra[] {
  return registros.filter((r) => r.nodo === nodo);
}

export function getCultivoColor(cultivo: string): string {
  return CULTIVOS_CONFIG[cultivo]?.color || '#999999';
}

export function getCultivoEmoji(cultivo: string): string {
  return CULTIVOS_CONFIG[cultivo]?.emoji || '🌱';
}

export function groupByDate(registros: RegistroSiembra[]): ChartData[] {
  const grouped = registros.reduce((acc, registro) => {
    const date = formatDateShort(registro.timestamp);
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const [dA, mA, yA] = a.name.split('/').map(Number);
      const [dB, mB, yB] = b.name.split('/').map(Number);
      return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
    });
}
