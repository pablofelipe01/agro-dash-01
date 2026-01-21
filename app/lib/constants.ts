// Constantes para Agro Sirius Dashboard

import { CultivoConfig } from './types';

export const CULTIVOS_CONFIG: Record<string, CultivoConfig> = {
  'Café': {
    nombre: 'Café',
    emoji: '☕',
    color: '#8B4513',
  },
  'Cacao': {
    nombre: 'Cacao',
    emoji: '🍫',
    color: '#6F4E37',
  },
  'Cítricos': {
    nombre: 'Cítricos',
    emoji: '🍊',
    color: '#FF8C00',
  },
};

export const VARIEDADES_POR_CULTIVO: Record<string, string[]> = {
  'Café': ['Balanceado', 'Frutal', 'Fuerte'],
  'Cacao': ['Criollo', 'Forastero', 'Trinitario'],
  'Cítricos': ['Naranja Valencia', 'Limón Tahití', 'Mandarina'],
};

export const VARIEDADES_EMOJIS: Record<string, string> = {
  'Naranja Valencia': '🍊',
  'Limón Tahití': '🍋',
  'Mandarina': '🍊',
  'Balanceado': '☕',
  'Frutal': '☕',
  'Fuerte': '☕',
  'Criollo': '🍫',
  'Forastero': '🍫',
  'Trinitario': '🍫',
};

export const MAPA_CONFIG = {
  center: [4.7277783, -74.07215] as [number, number],
  zoom: 13,
  maxZoom: 18,
  minZoom: 5,
};

export const LOTES_OPTIONS = [
  'Lote 1', 'Lote 2', 'Lote 3', 'Lote 4', 'Lote 5',
  'Lote 6', 'Lote 7', 'Lote 8', 'Lote 9', 'Lote 10',
];

export const SECTORES_OPTIONS = [
  'Sector A', 'Sector B', 'Sector C', 'Sector D', 'Sector E',
  'Sector F', 'Sector G', 'Sector H', 'Sector I', 'Sector J',
];

export const CULTIVOS_OPTIONS = Object.keys(CULTIVOS_CONFIG);
