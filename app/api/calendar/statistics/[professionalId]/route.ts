/**
 * GET /api/calendar/statistics/[professionalId]
 * 
 * Obtiene estadísticas del calendario de un profesional
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CalendarManager } from '@/app/lib/services/calendarManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { professionalId: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    const { professionalId } = params;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'startDate y endDate son requeridos' },
        { status: 400 }
      );
    }

    // Obtener estadísticas
    const statistics = await CalendarManager.getCalendarStatistics(
      professionalId,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      statistics,
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error al obtener estadísticas' 
      },
      { status: 500 }
    );
  }
}
