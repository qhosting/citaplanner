/**
 * POST /api/calendar/availability/validate
 * 
 * Valida si se puede crear/mover una cita en un horario específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CalendarManager } from '@/app/lib/services/calendarManager';
import { ValidateAvailabilityOptions } from '@/app/lib/types/calendar';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { professionalId, startTime, endTime, branchId, excludeAppointmentId } = body;

    if (!professionalId || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: 'professionalId, startTime y endTime son requeridos' },
        { status: 400 }
      );
    }

    const options: ValidateAvailabilityOptions = {
      professionalId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      branchId,
      excludeAppointmentId,
    };

    // Validar disponibilidad
    const validation = await CalendarManager.validateAvailability(options);

    return NextResponse.json({
      success: true,
      validation,
    });
  } catch (error: any) {
    console.error('Error al validar disponibilidad:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error al validar disponibilidad' 
      },
      { status: 500 }
    );
  }
}
