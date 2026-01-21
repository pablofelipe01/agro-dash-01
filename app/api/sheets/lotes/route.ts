// API Route: GET/POST lotes definidos

import { NextRequest, NextResponse } from 'next/server';
import { getLotesDefinidos, saveLote } from '@/app/lib/google-sheets';
import { CULTIVOS_CONFIG, LOTES_OPTIONS, SECTORES_OPTIONS, CULTIVOS_OPTIONS } from '@/app/lib/constants';

export async function GET() {
  try {
    const lotes = await getLotesDefinidos();

    return NextResponse.json({
      success: true,
      data: lotes,
      count: lotes.length,
    });
  } catch (error) {
    console.error('Error fetching lotes:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        data: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación de campos requeridos
    const { lote, sector, cultivo, variedad, hectareas, polygonCoords } = body;

    if (!lote || !sector || !cultivo || !variedad || hectareas === undefined || !polygonCoords) {
      return NextResponse.json(
        {
          success: false,
          error: 'Todos los campos son requeridos: lote, sector, cultivo, variedad, hectareas, polygonCoords',
        },
        { status: 400 }
      );
    }

    // Validar lote
    if (!LOTES_OPTIONS.includes(lote)) {
      return NextResponse.json(
        {
          success: false,
          error: `Lote inválido. Opciones válidas: ${LOTES_OPTIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validar sector
    if (!SECTORES_OPTIONS.includes(sector)) {
      return NextResponse.json(
        {
          success: false,
          error: `Sector inválido. Opciones válidas: ${SECTORES_OPTIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validar cultivo
    if (!CULTIVOS_OPTIONS.includes(cultivo)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cultivo inválido. Opciones válidas: ${CULTIVOS_OPTIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validar hectáreas
    const hectareasNum = parseFloat(hectareas);
    if (isNaN(hectareasNum) || hectareasNum <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hectáreas debe ser un número positivo',
        },
        { status: 400 }
      );
    }

    // Validar polígono
    if (!Array.isArray(polygonCoords) || polygonCoords.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'El polígono debe tener al menos 3 puntos',
        },
        { status: 400 }
      );
    }

    // Obtener color del cultivo
    const color = CULTIVOS_CONFIG[cultivo]?.color || '#999999';

    const loteData = {
      lote,
      sector,
      cultivo,
      variedad,
      hectareas: hectareasNum,
      polygonCoords,
      color,
    };

    await saveLote(loteData);

    return NextResponse.json({
      success: true,
      message: 'Lote guardado exitosamente',
      data: { ...loteData, createdAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error saving lote:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
