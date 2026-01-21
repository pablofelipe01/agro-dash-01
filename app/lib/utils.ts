// Utilidades para Agro Sirius Dashboard

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { RegistroSiembra, LoteDefinido, LotePintado, ChartData } from './types';
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

export function isValidCoordinates(lat: number, lon: number): boolean {
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

export function getCultivoColor(cultivo: string | null): string {
  if (!cultivo) return '#9CA3AF';
  return CULTIVOS_CONFIG[cultivo]?.color || '#999999';
}

export function getCultivoEmoji(cultivo: string | null): string {
  if (!cultivo) return '🌱';
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

// Calcular centroid de un poligono
export function calculatePolygonCenter(coords: [number, number][]): [number, number] {
  if (coords.length === 0) return [0, 0];

  let latSum = 0;
  let lonSum = 0;

  for (const [lat, lon] of coords) {
    latSum += lat;
    lonSum += lon;
  }

  return [latSum / coords.length, lonSum / coords.length];
}

// Calcular area de un poligono en hectareas usando formula geodesica
// Usa el metodo de Shoelace adaptado para coordenadas geograficas
export function calculatePolygonAreaHectareas(coords: [number, number][]): number {
  if (coords.length < 3) return 0;

  const EARTH_RADIUS = 6371000; // Radio de la Tierra en metros

  // Convertir grados a radianes
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Calcular area usando formula esferica (Shoelace en esfera)
  let area = 0;
  const n = coords.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = toRad(coords[i][0]);
    const lon1 = toRad(coords[i][1]);
    const lat2 = toRad(coords[j][0]);
    const lon2 = toRad(coords[j][1]);

    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs(area * EARTH_RADIUS * EARTH_RADIUS / 2);

  // Convertir metros cuadrados a hectareas (1 ha = 10,000 m²)
  const hectareas = area / 10000;

  return Math.round(hectareas * 100) / 100; // Redondear a 2 decimales
}

// Agrupar sectores por Lote y calcular totales
export interface LoteAgrupado {
  lote: string;
  sectores: {
    sector: string;
    hectareasPoligono: number;
    cultivo: string | null;
  }[];
  hectareasTotales: number;
  cantidadSectores: number;
}

export function agruparPorLote(lotesPintados: LotePintado[]): LoteAgrupado[] {
  const agrupado = lotesPintados.reduce((acc, lp) => {
    if (!acc[lp.lote]) {
      acc[lp.lote] = {
        lote: lp.lote,
        sectores: [],
        hectareasTotales: 0,
        cantidadSectores: 0,
      };
    }

    const hectareasPoligono = calculatePolygonAreaHectareas(lp.polygonCoords);

    acc[lp.lote].sectores.push({
      sector: lp.sector,
      hectareasPoligono,
      cultivo: lp.cultivo,
    });
    acc[lp.lote].hectareasTotales += hectareasPoligono;
    acc[lp.lote].cantidadSectores += 1;

    return acc;
  }, {} as Record<string, LoteAgrupado>);

  // Ordenar por numero de lote y redondear totales
  return Object.values(agrupado)
    .map((l) => ({
      ...l,
      hectareasTotales: Math.round(l.hectareasTotales * 100) / 100,
    }))
    .sort((a, b) => {
      const numA = parseInt(a.lote.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.lote.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
}

// Obtener lotes que estan definidos pero no tienen cultivo
export function getLotesVacios(lotesPintados: LotePintado[]): LotePintado[] {
  return lotesPintados.filter((lote) => lote.cultivo === null);
}

// Obtener lotes que tienen cultivo asignado
export function getLotesSembrados(lotesPintados: LotePintado[]): LotePintado[] {
  return lotesPintados.filter((lote) => lote.cultivo !== null);
}

// Formatear nombre de lote
export function formatLoteNombre(lote: string, sector: string): string {
  return `${lote} - ${sector}`;
}

// Obtener info del cultivo
export function getCultivoInfo(cultivo: string | null): { emoji: string; color: string } {
  if (!cultivo || !CULTIVOS_CONFIG[cultivo]) {
    return { emoji: '🌱', color: '#9CA3AF' };
  }
  return {
    emoji: CULTIVOS_CONFIG[cultivo].emoji,
    color: CULTIVOS_CONFIG[cultivo].color,
  };
}

// Mapear registros a lotes - crear lotes pintados
// FLUJO: Sheet1 registros -> Sheet2 lotes -> Pintar con cultivo
// Las hectareas se calculan del poligono, no de los registros
export function mapRegistrosToLotes(
  registros: RegistroSiembra[],
  lotesDefinidos: LoteDefinido[]
): LotePintado[] {
  return lotesDefinidos.map((lote) => {
    // Calcular hectareas del poligono
    const hectareasPoligono = calculatePolygonAreaHectareas(lote.polygonCoords);

    // Buscar registros que coincidan con este lote + sector
    const registrosLote = registros.filter(
      (r) => r.lote === lote.lote && r.sector === lote.sector
    );

    if (registrosLote.length === 0) {
      // Lote sin cultivo - gris neutral
      return {
        lote: lote.lote,
        sector: lote.sector,
        polygonCoords: lote.polygonCoords,
        cultivo: null,
        variedad: null,
        emoji: null,
        color: '#E5E7EB', // gris claro
        cantidadRegistros: 0,
        hectareasTotales: hectareasPoligono, // Usar hectareas del poligono
        ultimoRegistro: null,
      };
    }

    // Ordenar por timestamp descendente para obtener el mas reciente
    const registrosOrdenados = [...registrosLote].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const registroReciente = registrosOrdenados[0];
    const cultivoInfo = getCultivoInfo(registroReciente.cultivo);

    return {
      lote: lote.lote,
      sector: lote.sector,
      polygonCoords: lote.polygonCoords,
      cultivo: registroReciente.cultivo,
      variedad: registroReciente.variedad,
      emoji: cultivoInfo.emoji,
      color: cultivoInfo.color,
      cantidadRegistros: registrosLote.length,
      hectareasTotales: hectareasPoligono, // Usar hectareas del poligono
      ultimoRegistro: registroReciente.timestamp,
    };
  });
}

// Agrupar lotes pintados por cultivo para graficos
export function groupLotesByCultivo(lotesPintados: LotePintado[]): ChartData[] {
  const lotesSembrados = getLotesSembrados(lotesPintados);

  const grouped = lotesSembrados.reduce((acc, lote) => {
    const cultivo = lote.cultivo || 'Sin clasificar';
    if (!acc[cultivo]) {
      acc[cultivo] = { count: 0, hectareas: 0 };
    }
    acc[cultivo].count += 1;
    acc[cultivo].hectareas += lote.hectareasTotales;
    return acc;
  }, {} as Record<string, { count: number; hectareas: number }>);

  return Object.entries(grouped).map(([name, data]) => ({
    name,
    value: data.hectareas,
    count: data.count,
    color: CULTIVOS_CONFIG[name]?.color || '#999999',
    emoji: CULTIVOS_CONFIG[name]?.emoji || '🌱',
  }));
}
