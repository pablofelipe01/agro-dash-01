// Tipos TypeScript para Agro Sirius Dashboard

// Registro de siembra desde Sheet1 (app movil)
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

// Lote definido en Sheet2 - estructura base de la finca (sin cultivo)
export interface LoteDefinido {
  lote: string;
  sector: string;
  polygonCoords: [number, number][];
  createdAt: string;
}

// Lote pintado - lote con cultivo mapeado desde registros
export interface LotePintado {
  lote: string;
  sector: string;
  polygonCoords: [number, number][];
  cultivo: string | null;
  variedad: string | null;
  emoji: string | null;
  color: string;
  cantidadRegistros: number;
  hectareasTotales: number;
  ultimoRegistro: string | null;
}

export interface CultivoConfig {
  nombre: string;
  emoji: string;
  color: string;
}

export interface AppState {
  registros: RegistroSiembra[];
  lotesDefinidos: LoteDefinido[];
  lotesPintados: LotePintado[];
  isLoading: boolean;
  error: string | null;
  modoEdicion: boolean;
  coordenadasBase: [number, number] | null;
}

export interface AppActions {
  fetchRegistros: () => Promise<void>;
  fetchLotes: () => Promise<void>;
  addLote: (loteData: Omit<LoteDefinido, 'createdAt'>) => Promise<void>;
  setCoordenadaBase: (coords: [number, number]) => void;
  toggleModoEdicion: () => void;
  refetchAll: () => Promise<void>;
  clearError: () => void;
  clearFinca: () => Promise<void>;
}

export type AppStore = AppState & AppActions;

export interface LoteFormData {
  lote: string;
  sector: string;
  polygonCoords: [number, number][];
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  emoji?: string;
  [key: string]: string | number | undefined;
}
