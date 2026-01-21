// API Route: GET registros de siembra

import { NextResponse } from 'next/server';
import { getRegistrosSiembra } from '@/app/lib/google-sheets';

export async function GET() {
  try {
    const registros = await getRegistrosSiembra();

    return NextResponse.json({
      success: true,
      data: registros,
      count: registros.length,
    });
  } catch (error) {
    console.error('Error fetching registros:', error);

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
