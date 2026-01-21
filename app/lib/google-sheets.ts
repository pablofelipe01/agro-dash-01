// Cliente Google Sheets API para Agro Sirius Dashboard
// FLUJO: Sheet1 (registros siembra) + Sheet2 (lotes definidos) -> Mapear -> Pintar

import { google } from 'googleapis';
import { RegistroSiembra, LoteDefinido } from './types';
import path from 'path';
import fs from 'fs';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_REGISTROS = process.env.GOOGLE_SHEET_REGISTROS || 'Sheet1';
const SHEET_LOTES = process.env.GOOGLE_SHEET_LOTES || 'Lotes Definidos';

async function getAuthClient() {
  // Intenta primero con GOOGLE_CREDENTIALS_JSON (para Vercel)
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth;
  }

  // Fallback a credentials.json local
  const credentialsPath = path.join(process.cwd(), 'credentials.json');

  if (!fs.existsSync(credentialsPath)) {
    throw new Error('No se encontró credentials.json ni GOOGLE_CREDENTIALS_JSON');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

async function getSheetsClient() {
  const auth = await getAuthClient();
  return google.sheets({ version: 'v4', auth });
}

// Obtener registros de siembra desde Sheet1
export async function getRegistrosSiembra(): Promise<RegistroSiembra[]> {
  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SPREADSHEET_ID no está configurado');
  }

  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_REGISTROS}!A:K`,
  });

  const rows = response.data.values;

  if (!rows || rows.length <= 1) {
    return [];
  }

  // Asume que la primera fila es el encabezado, la ignoramos
  const [, ...dataRows] = rows;

  return dataRows.map((row, index) => ({
    id: row[0] || `registro-${index}`,
    timestamp: row[1] || '',
    nodo: row[2] || '',
    cultivo: row[3] || '',
    variedad: row[4] || '',
    lote: row[5] || '',
    sector: row[6] || '',
    hectareas: parseFloat(row[7]) || 0,
    gpsLat: row[8] ? parseFloat(row[8]) : null,
    gpsLon: row[9] ? parseFloat(row[9]) : null,
    notas: row[10] || '',
  }));
}

// Obtener lotes definidos desde Sheet2
// Sheet2 estructura SIMPLIFICADA: Lote | Sector | Polygon_Coords | Created_At
export async function getLotesDefinidos(): Promise<LoteDefinido[]> {
  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SPREADSHEET_ID no está configurado');
  }

  const sheets = await getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_LOTES}!A:D`,
    });

    const rows = response.data.values;

    if (!rows || rows.length <= 1) {
      return [];
    }

    const [, ...dataRows] = rows;

    return dataRows.map((row) => {
      let polygonCoords: [number, number][] = [];

      // Parsear Polygon_Coords (es string JSON)
      if (row[2]) {
        try {
          polygonCoords = JSON.parse(row[2]);
        } catch {
          console.error('Error parsing polygon coords:', row[2]);
          polygonCoords = [];
        }
      }

      return {
        lote: row[0] || '',
        sector: row[1] || '',
        polygonCoords,
        createdAt: row[3] || new Date().toISOString(),
      };
    });
  } catch (error: unknown) {
    // Si la hoja no existe, retornar array vacío
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Unable to parse range')) {
      console.log('Hoja de lotes no existe aún, retornando array vacío');
      return [];
    }
    throw error;
  }
}

// Guardar nuevo lote en Sheet2
// Solo guarda: lote, sector, polygonCoords, createdAt
// NO guarda cultivo, variedad, color (esos vienen de Sheet1)
export async function saveLote(loteData: Omit<LoteDefinido, 'createdAt'>): Promise<void> {
  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SPREADSHEET_ID no está configurado');
  }

  const sheets = await getSheetsClient();

  // Primero verificar si la hoja existe, si no, crear encabezados
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_LOTES}!A1`,
    });
  } catch {
    // La hoja no existe, crear encabezados simplificados
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_LOTES}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Lote', 'Sector', 'Polygon_Coords', 'Created_At']],
      },
    });
  }

  const createdAt = new Date().toISOString();

  // Datos simplificados - sin cultivo, variedad, color
  const rowData = [
    loteData.lote,
    loteData.sector,
    JSON.stringify(loteData.polygonCoords),
    createdAt,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_LOTES}!A:D`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowData],
    },
  });
}

// Verificar si un lote+sector ya existe
export async function existeLote(lote: string, sector: string): Promise<boolean> {
  const lotes = await getLotesDefinidos();
  return lotes.some((l) => l.lote === lote && l.sector === sector);
}
