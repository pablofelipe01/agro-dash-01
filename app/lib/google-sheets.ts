// Cliente Google Sheets API para Agro Sirius Dashboard

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

export async function getLotesDefinidos(): Promise<LoteDefinido[]> {
  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SPREADSHEET_ID no está configurado');
  }

  const sheets = await getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_LOTES}!A:H`,
    });

    const rows = response.data.values;

    if (!rows || rows.length <= 1) {
      return [];
    }

    const [, ...dataRows] = rows;

    return dataRows.map((row) => ({
      lote: row[0] || '',
      sector: row[1] || '',
      cultivo: row[2] || '',
      variedad: row[3] || '',
      hectareas: parseFloat(row[4]) || 0,
      polygonCoords: row[5] ? JSON.parse(row[5]) : [],
      color: row[6] || '#999999',
      createdAt: row[7] || new Date().toISOString(),
    }));
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

export async function saveLote(loteData: Omit<LoteDefinido, 'createdAt'>): Promise<void> {
  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SPREADSHEET_ID no está configurado');
  }

  const sheets = await getSheetsClient();

  // Primero verificar si la hoja existe, si no, crearla
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_LOTES}!A1`,
    });
  } catch {
    // La hoja no existe, crear encabezados
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_LOTES}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Lote', 'Sector', 'Cultivo', 'Variedad', 'Hectareas', 'PolygonCoords', 'Color', 'CreatedAt']],
      },
    });
  }

  const createdAt = new Date().toISOString();

  const rowData = [
    loteData.lote,
    loteData.sector,
    loteData.cultivo,
    loteData.variedad,
    loteData.hectareas.toString(),
    JSON.stringify(loteData.polygonCoords),
    loteData.color,
    createdAt,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_LOTES}!A:H`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowData],
    },
  });
}
