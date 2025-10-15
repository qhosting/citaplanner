import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * GET /api/dashboard/metrics
 * Obtiene métricas del dashboard del tenant actual
 * 
 * Query params opcionales:
 * - branchId: string (filtrar por sucursal específica)
 * - startDate: string (fecha inicio en formato ISO, default: inicio del día actual)
 * - endDate: string (fecha fin en formato ISO, default: fin del día actual)
 * 
 * Métricas incluidas:
 * - Citas: total hoy, completadas, pendientes, canceladas
 * - Ingresos: hoy, esta semana, este mes
 * - Clientes: nuevos este mes, total activos
 * - Profesionales: activos
 * - Métricas calculadas: precio promedio servicios, tasa de completado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const tenantId = session.user.tenantId;

    // Obtener query parameters
    const searchParams = request.nextUrl.searchParams;
    const branchIdParam = searchParams.get('branchId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Validar branchId si se proporciona
    if (branchIdParam) {
      const branch = await prisma.branch.findFirst({
        where: {
          id: branchIdParam,
          tenantId: tenantId,
        },
      });

      if (!branch) {
        return NextResponse.json(
          { success: false, error: 'La sucursal especificada no existe o no pertenece a tu cuenta' },
          { status: 400 }
        );
      }
    }

    // Calcular fechas
    const now = new Date();
    
    // Fecha inicio: inicio del día actual (o fecha personalizada)
    const startDate = startDateParam 
      ? new Date(startDateParam)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    
    // Fecha fin: fin del día actual (o fecha personalizada)
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Validar formato de fechas
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Formato de startDate inválido. Usar formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)' },
        { status: 400 }
      );
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Formato de endDate inválido. Usar formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)' },
        { status: 400 }
      );
    }

    // Validar que endDate >= startDate
    if (endDate < startDate) {
      return NextResponse.json(
        { success: false, error: 'La fecha de fin debe ser mayor o igual a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Calcular inicio de la semana (lunes)
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si es domingo (0), retroceder 6 días
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calcular inicio del mes
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    // Construir where clause base
    const baseWhere: any = {
      tenantId: tenantId,
    };

    if (branchIdParam) {
      baseWhere.branchId = branchIdParam;
    }

    // Ejecutar todas las queries en paralelo con Promise.all para optimizar performance
    const [
      // Citas en el rango de fechas especificado (hoy por defecto)
      appointmentsInRange,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      
      // Ingresos
      revenueInRange,
      weeklyRevenue,
      monthlyRevenue,
      
      // Clientes
      newClientsThisMonth,
      totalClients,
      
      // Profesionales
      activeProfessionals,
      
      // Precio promedio de servicios
      serviceStats,
    ] = await Promise.all([
      // Citas en el rango de fechas (hoy por defecto)
      prisma.appointment.count({
        where: {
          ...baseWhere,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      
      // Citas completadas en el rango
      prisma.appointment.count({
        where: {
          ...baseWhere,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
          status: 'COMPLETED',
        },
      }),
      
      // Citas pendientes o confirmadas en el rango
      prisma.appointment.count({
        where: {
          ...baseWhere,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      }),
      
      // Citas canceladas en el rango
      prisma.appointment.count({
        where: {
          ...baseWhere,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
          status: 'CANCELLED',
        },
      }),
      
      // Ingresos en el rango de fechas (pagos con status PAID)
      prisma.payment.aggregate({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),
      
      // Ingresos de esta semana
      prisma.payment.aggregate({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startOfWeek,
          },
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),
      
      // Ingresos de este mes
      prisma.payment.aggregate({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startOfMonth,
          },
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),
      
      // Clientes nuevos este mes
      prisma.client.count({
        where: {
          tenantId: tenantId, // No filtrar por sucursal para clientes
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      
      // Total de clientes activos
      prisma.client.count({
        where: {
          tenantId: tenantId, // No filtrar por sucursal para clientes
          isActive: true,
        },
      }),
      
      // Profesionales activos
      prisma.user.count({
        where: {
          tenantId: tenantId, // No filtrar por sucursal para profesionales
          isActive: true,
          role: {
            in: ['PROFESSIONAL', 'ADMIN'],
          },
        },
      }),
      
      // Estadísticas de servicios (precio promedio)
      prisma.service.aggregate({
        where: {
          tenantId: tenantId,
          isActive: true,
        },
        _avg: {
          price: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Calcular tasa de completado
    const completionRate = appointmentsInRange > 0
      ? Math.round((completedAppointments / appointmentsInRange) * 100)
      : 0;

    // Construir respuesta
    const response = {
      success: true,
      data: {
        appointments: {
          today: appointmentsInRange,
          completed: completedAppointments,
          pending: pendingAppointments,
          cancelled: cancelledAppointments,
        },
        revenue: {
          today: revenueInRange._sum.amount || 0,
          weekly: weeklyRevenue._sum.amount || 0,
          monthly: monthlyRevenue._sum.amount || 0,
        },
        clients: {
          newThisMonth: newClientsThisMonth,
          total: totalClients,
        },
        professionals: {
          active: activeProfessionals,
        },
        metrics: {
          averageServicePrice: serviceStats._avg.price || 0,
          completionRate: completionRate,
        },
      },
      meta: {
        branchId: branchIdParam || null,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener las métricas del dashboard' },
      { status: 500 }
    );
  }
}
