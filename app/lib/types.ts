// Tipos TypeScript para Agro Sirius Dashboard

export interface RegistroSiembra {
  id: string;
  timestamp: string;
  nodo: string;
  cultivo: string;
  variedad: string;
  lote: string;
  sector: string;
  hectareas: number;
  gpsLat: number | null;
  gpsLon: number | null;
  notas: string;
}

export interface LoteDefinido {
  lote: string;
  sector: string;
  cultivo: string;
  variedad: string;
  hectareas: number;
  polygonCoords: [number, number][];
  color: string;
  createdAt: string;
}

export interface CultivoConfig {
  nombre: string;
  emoji: string;
  color: string;
}

export interface AppState {
  registros: RegistroSiembra[];
  lotes: LoteDefinido[];
  isLoading: boolean;
  error: string | null;
  selectedCultivo: string | null;
  selectedNodo: string | null;
}

export interface AppActions {
  fetchRegistros: () => Promise<void>;
  fetchLotes: () => Promise<void>;
  addLote: (loteData: Omit<LoteDefinido, 'createdAt'>) => Promise<void>;
  setFilter: (cultivo?: string | null, nodo?: string | null) => void;
  clearError: () => void;
}

export type AppStore = AppState & AppActions;

export interface LoteFormData {
  lote: string;
  sector: string;
  cultivo: string;
  variedad: string;
  hectareas: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  emoji?: string;
  [key: string]: string | number | undefined;
}
