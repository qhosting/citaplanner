
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const searchParams = request.nextUrl.searchParams;

    const filters: any = {
      tenantId,
    };

    // Filtros opcionales
    if (searchParams.get('clientId')) {
      filters.clientId = searchParams.get('clientId');
    }
    if (searchParams.get('userId')) {
      filters.userId = searchParams.get('userId');
    }
    if (searchParams.get('serviceId')) {
      filters.serviceId = searchParams.get('serviceId');
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as AppointmentStatus;
    }
    if (searchParams.get('startDate')) {
      filters.startTime = {
        gte: new Date(searchParams.get('startDate')!),
      };
    }
    if (searchParams.get('endDate')) {
      filters.endTime = {
        lte: new Date(searchParams.get('endDate')!),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: filters,
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
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: appointments });
  } catch (error: any) {
    console.error('Error al obtener citas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const data = await request.json();

    // Validaciones
    if (!data.clientId) {
      return NextResponse.json({ success: false, error: 'Cliente es requerido' }, { status: 400 });
    }
    if (!data.serviceId) {
      return NextResponse.json({ success: false, error: 'Servicio es requerido' }, { status: 400 });
    }
    if (!data.userId) {
      return NextResponse.json({ success: false, error: 'Profesional es requerido' }, { status: 400 });
    }
    if (!data.branchId) {
      return NextResponse.json({ success: false, error: 'Sucursal es requerida' }, { status: 400 });
    }
    if (!data.startTime) {
      return NextResponse.json({ success: false, error: 'Fecha y hora de inicio son requeridas' }, { status: 400 });
    }

    // Obtener duración del servicio para calcular endTime
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      return NextResponse.json({ success: false, error: 'Servicio no encontrado' }, { status: 404 });
    }

    const startTime = new Date(data.startTime);
    const endTime = data.endTime 
      ? new Date(data.endTime)
      : new Date(startTime.getTime() + service.duration * 60000);

    // Verificar conflictos de horario
    const conflicts = await prisma.appointment.findMany({
      where: {
        userId: data.userId,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
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

    // Crear la cita
    const appointment = await prisma.appointment.create({
      data: {
        tenantId,
        clientId: data.clientId,
        serviceId: data.serviceId,
        userId: data.userId,
        branchId: data.branchId,
        startTime,
        endTime,
        status: data.status || AppointmentStatus.PENDING,
        notes: data.notes || null,
        isOnline: false,
        notificationsSent: false,
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

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear cita:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
