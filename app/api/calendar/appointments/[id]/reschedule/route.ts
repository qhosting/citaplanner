/**
 * PATCH /api/calendar/appointments/[id]/reschedule
 * 
 * Reprograma una cita (drag & drop)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CalendarManager } from '@/app/lib/services/calendarManager';
import { PrismaClient } from '@prisma/client';
import { notifyAppointmentUpdated } from '@/app/lib/services/whatsappNotificationHelper';

const prisma = new PrismaClient();

export async function PATCH(
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

    const appointmentId = params.id;
    const body = await request.json();
    const { newStartTime, newEndTime, reason } = body;

    if (!newStartTime || !newEndTime) {
      return NextResponse.json(
        { success: false, message: 'newStartTime y newEndTime son requeridos' },
        { status: 400 }
      );
    }

    // Obtener cita existente
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        professional: true,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    const startDate = new Date(newStartTime);
    const endDate = new Date(newEndTime);

    // Validar disponibilidad (excluyendo la cita actual)
    const validation = await CalendarManager.validateAvailability({
      professionalId: existingAppointment.professionalId,
      startTime: startDate,
      endTime: endDate,
      branchId: existingAppointment.branchId,
      excludeAppointmentId: appointmentId,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: validation.reason || 'Horario no disponible',
          validation 
        },
        { status: 400 }
      );
    }

    // Actualizar la cita
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: startDate,
        endTime: endDate,
        notes: reason 
          ? `${existingAppointment.notes || ''}\n\nReprogramada: ${reason}`
          : existingAppointment.notes,
        updatedBy: session.user.id,
      },
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
        branch: true,
      },
    });

    // Send WhatsApp notification (non-blocking)
    notifyAppointmentUpdated(updatedAppointment.id);

    return NextResponse.json({
      success: true,
      message: 'Cita reprogramada exitosamente',
      appointment: updatedAppointment,
    });
  } catch (error: any) {
    console.error('Error al reprogramar cita:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error al reprogramar cita' 
      },
      { status: 500 }
    );
  }
}
