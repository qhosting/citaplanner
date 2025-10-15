/**
 * POST /api/calendar/appointments
 * 
 * Crea una nueva cita desde el calendario
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CalendarManager } from '@/app/lib/services/calendarManager';
import { PrismaClient } from '@prisma/client';
import { notifyAppointmentCreated } from '@/app/lib/services/whatsappNotificationHelper';

const prisma = new PrismaClient();

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
    const { professionalId, clientId, serviceId, branchId, startTime, endTime, notes } = body;

    if (!professionalId || !clientId || !serviceId || !branchId || !startTime || !endTime) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'professionalId, clientId, serviceId, branchId, startTime y endTime son requeridos' 
        },
        { status: 400 }
      );
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Validar disponibilidad
    const validation = await CalendarManager.validateAvailability({
      professionalId,
      startTime: startDate,
      endTime: endDate,
      branchId,
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

    // Obtener tenant del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json(
        { success: false, message: 'Usuario sin tenant' },
        { status: 400 }
      );
    }

    // Crear la cita
    const appointment = await prisma.appointment.create({
      data: {
        tenantId: user.tenantId,
        professionalId,
        clientId,
        serviceId,
        branchId,
        startTime: startDate,
        endTime: endDate,
        status: 'CONFIRMED',
        notes: notes || '',
        createdBy: session.user.id,
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
    notifyAppointmentCreated(appointment.id);

    return NextResponse.json({
      success: true,
      message: 'Cita creada exitosamente',
      appointment,
    });
  } catch (error: any) {
    console.error('Error al crear cita:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error al crear cita' 
      },
      { status: 500 }
    );
  }
}
