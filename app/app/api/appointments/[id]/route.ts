
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            color: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ success: false, error: 'Cita no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error('Error al obtener cita:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const data = await request.json();

    // Verificar que la cita existe y pertenece al tenant
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json({ success: false, error: 'Cita no encontrada' }, { status: 404 });
    }

    // Preparar datos de actualización
    const updateData: any = {};

    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.serviceId !== undefined) updateData.serviceId = data.serviceId;
    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.branchId !== undefined) updateData.branchId = data.branchId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Si se actualiza la hora de inicio, recalcular hora de fin
    if (data.startTime !== undefined) {
      updateData.startTime = new Date(data.startTime);

      if (data.endTime !== undefined) {
        updateData.endTime = new Date(data.endTime);
      } else {
        // Obtener duración del servicio
        const serviceId = data.serviceId || existingAppointment.serviceId;
        const service = await prisma.service.findUnique({
          where: { id: serviceId },
        });

        if (service) {
          updateData.endTime = new Date(updateData.startTime.getTime() + service.duration * 60000);
        }
      }

      // Verificar conflictos de horario si se cambia el horario o el profesional
      const userIdToCheck = data.userId || existingAppointment.userId;
      const conflicts = await prisma.appointment.findMany({
        where: {
          id: { not: params.id },
          userId: userIdToCheck,
          status: {
            not: AppointmentStatus.CANCELLED,
          },
          OR: [
            {
              AND: [
                { startTime: { lte: updateData.startTime } },
                { endTime: { gt: updateData.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: updateData.endTime } },
                { endTime: { gte: updateData.endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: updateData.startTime } },
                { endTime: { lte: updateData.endTime } },
              ],
            },
          ],
        },
      });

      if (conflicts.length > 0) {
        return NextResponse.json(
          { success: false, error: 'El profesional ya tiene una cita en ese horario' },
          { status: 409 }
        );
      }
    }

    // Actualizar la cita
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            color: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error('Error al actualizar cita:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    // Verificar que la cita existe y pertenece al tenant
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json({ success: false, error: 'Cita no encontrada' }, { status: 404 });
    }

    // En lugar de eliminar, marcar como cancelada
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: AppointmentStatus.CANCELLED,
      },
    });

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error('Error al eliminar cita:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
