// API Route: GET/POST lotes definidos
// GET: Retorna lotes pintados (con cultivo mapeado desde registros)
// POST: Guarda nuevo lote (solo estructura, sin cultivo)

import { NextRequest, NextResponse } from 'next/server';
import { getLotesDefinidos, getRegistrosSiembra, saveLote, existeLote } from '@/app/lib/google-sheets';
import { mapRegistrosToLotes } from '@/app/lib/utils';
import { LOTES_OPTIONS, SECTORES_OPTIONS } from '@/app/lib/constants';

export async function GET() {
  try {
    // Obtener lotes definidos (estructura de finca)
    const lotesDefinidos = await getLotesDefinidos();

    // Obtener registros de siembra
    const registros = await getRegistrosSiembra();

    // Mapear registros a lotes para obtener lotes pintados
    const lotesPintados = mapRegistrosToLotes(registros, lotesDefinidos);

    return NextResponse.json({
      success: true,
      data: {
        lotesDefinidos,
        lotesPintados,
      },
      count: {
        definidos: lotesDefinidos.length,
        pintados: lotesPintados.length,
        conCultivo: lotesPintados.filter((l) => l.cultivo !== null).length,
        sinCultivo: lotesPintados.filter((l) => l.cultivo === null).length,
      },
    });
  } catch (error) {
    console.error('Error fetching lotes:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        data: { lotesDefinidos: [], lotesPintados: [] },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Solo necesitamos: lote, sector, polygonCoords
    const { lote, sector, polygonCoords } = body;

    // Validacion de campos requeridos
    if (!lote || !sector || !polygonCoords) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos requeridos: lote, sector, polygonCoords',
        },
        { status: 400 }
      );
    }

    // Validar lote
    if (!LOTES_OPTIONS.includes(lote)) {
      return NextResponse.json(
        {
          success: false,
          error: `Lote invalido. Opciones: ${LOTES_OPTIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validar sector
    if (!SECTORES_OPTIONS.includes(sector)) {
      return NextResponse.json(
        {
          success: false,
          error: `Sector invalido. Opciones: ${SECTORES_OPTIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validar poligono
    if (!Array.isArray(polygonCoords) || polygonCoords.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'El poligono debe tener al menos 3 puntos',
        },
        { status: 400 }
      );
    }

    // Verificar que no exista ya ese lote + sector
    const yaExiste = await existeLote(lote, sector);
    if (yaExiste) {
      return NextResponse.json(
        {
          success: false,
          error: `Ya existe un lote definido para ${lote} - ${sector}`,
        },
        { status: 400 }
      );
    }

    // Guardar lote (solo estructura, sin cultivo)
    const loteData = {
      lote,
      sector,
      polygonCoords,
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
