import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * GET /api/branches/[id]
 * Obtiene una sucursal específica por ID con estadísticas detalladas
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener la sucursal con información básica
    const branch = await prisma.branch.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Sucursal no encontrada' },
        { status: 404 }
      );
    }

    // Calcular fechas para estadísticas
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Obtener estadísticas de usuarios asignados
    const usersCount = await prisma.user.count({
      where: {
        branchId: params.id,
        isActive: true,
      },
    });

    // Obtener estadísticas de profesionales asignados (Fase 2)
    const professionalsCount = await prisma.branchAssignment.count({
      where: {
        branchId: params.id,
        isActive: true,
      },
    });

    // Obtener estadísticas de citas
    const [
      appointmentsToday,
      appointmentsThisMonth,
      appointmentsTotal,
      appointmentsCompleted,
      appointmentsCancelled,
    ] = await Promise.all([
      // Citas de hoy
      prisma.appointment.count({
        where: {
          branchId: params.id,
          startTime: {
            gte: startOfToday,
            lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Citas de este mes
      prisma.appointment.count({
        where: {
          branchId: params.id,
          startTime: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
      }),
      // Total de citas
      prisma.appointment.count({
        where: {
          branchId: params.id,
        },
      }),
      // Citas completadas (este mes)
      prisma.appointment.count({
        where: {
          branchId: params.id,
          status: 'COMPLETED',
          startTime: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
      }),
      // Citas canceladas (este mes)
      prisma.appointment.count({
        where: {
          branchId: params.id,
          status: 'CANCELLED',
          startTime: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
      }),
    ]);

    // Obtener estadísticas de ingresos (este mes)
    const paymentsThisMonth = await prisma.payment.aggregate({
      where: {
        branchId: params.id,
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Obtener ingresos totales
    const paymentsTotal = await prisma.payment.aggregate({
      where: {
        branchId: params.id,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Obtener próximas citas (próximas 5)
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        branchId: params.id,
        startTime: {
          gte: now,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 5,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    // Obtener profesionales asignados a esta sucursal
    const assignedProfessionals = await prisma.branchAssignment.findMany({
      where: {
        branchId: params.id,
        isActive: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { professional: { firstName: 'asc' } },
      ],
      take: 10,
      select: {
        id: true,
        isPrimary: true,
        startDate: true,
        endDate: true,
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        branch,
        stats: {
          users: usersCount,
          professionals: professionalsCount,
          appointments: {
            today: appointmentsToday,
            thisMonth: appointmentsThisMonth,
            total: appointmentsTotal,
            completed: appointmentsCompleted,
            cancelled: appointmentsCancelled,
          },
          revenue: {
            thisMonth: paymentsThisMonth._sum.amount || 0,
            thisMonthCount: paymentsThisMonth._count || 0,
            total: paymentsTotal._sum.amount || 0,
            totalCount: paymentsTotal._count || 0,
          },
        },
        upcomingAppointments,
        assignedProfessionals,
      },
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener la sucursal' },
      { status: 500 }
    );
  }
}
