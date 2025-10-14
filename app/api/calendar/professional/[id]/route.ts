/**
 * GET /api/calendar/professional/[id]
 * 
 * Obtiene los eventos del calendario de un profesional
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CalendarManager } from '@/app/lib/services/calendarManager';
import { CalendarFilters } from '@/app/lib/types/calendar';
import { AppointmentStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const professionalId = params.id;
    const { searchParams } = new URL(request.url);

    // Parsear parámetros de query
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const branchId = searchParams.get('branchId') || undefined;
    const status = searchParams.get('status') || undefined;
    const serviceId = searchParams.get('serviceId') || undefined;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'startDate y endDate son requeridos' },
        { status: 400 }
      );
    }

    // Construir filtros
    const filters: CalendarFilters = {
      professionalId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      branchId,
      status: status as AppointmentStatus | 'ALL' | undefined,
      serviceId,
    };

    // Obtener eventos y disponibilidad
    const { events, availability } = await CalendarManager.getCalendarEvents(
      filters,
      session.user.id,
      session.user.role
    );

    return NextResponse.json({
      success: true,
      events,
      availability,
    });
  } catch (error: any) {
    console.error('Error al obtener eventos del calendario:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error al obtener eventos del calendario' 
      },
      { status: 500 }
    );
  }
}
