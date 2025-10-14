/**
 * GET /api/calendar/availability/[professionalId]/slots
 * 
 * Obtiene slots disponibles para agendar
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

    const date = searchParams.get('date');
    const duration = searchParams.get('duration');
    const branchId = searchParams.get('branchId') || undefined;

    if (!date || !duration) {
      return NextResponse.json(
        { success: false, message: 'date y duration son requeridos' },
        { status: 400 }
      );
    }

    // Obtener slots disponibles
    const slots = await CalendarManager.getAvailableSlots(
      professionalId,
      new Date(date),
      parseInt(duration),
      branchId
    );

    return NextResponse.json({
      success: true,
      slots,
    });
  } catch (error: any) {
    console.error('Error al obtener slots disponibles:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error al obtener slots disponibles' 
      },
      { status: 500 }
    );
  }
}
