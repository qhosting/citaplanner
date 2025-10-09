
import { prisma } from '@/lib/prisma';

export interface ClientHistoryFilters {
  clientProfileId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}

/**
 * Get appointment history for a client
 */
export async function getClientAppointmentHistory(filters: ClientHistoryFilters = {}) {
  try {
    const { clientProfileId, userId, startDate, endDate, skip = 0, take = 50 } = filters;

    if (!clientProfileId && !userId) {
      throw new Error('Either clientProfileId or userId must be provided');
    }

    // Get user ID from client profile if needed
    let targetUserId = userId;
    if (clientProfileId && !userId) {
      const profile = await prisma.clientProfile.findUnique({
        where: { id: clientProfileId },
        select: { userId: true },
      });
      if (!profile) {
        throw new Error('Client profile not found');
      }
      targetUserId = profile.userId;
    }

    // Find associated client records
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { tenantId: true, email: true, phone: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Find client records by phone or email
    const clients = await prisma.client.findMany({
      where: {
        tenantId: user.tenantId,
        OR: [
          { phone: user.phone || '' },
          { email: user.email },
        ],
      },
      select: { id: true },
    });

    const clientIds = clients.map((c) => c.id);

    const where: any = {
      clientId: { in: clientIds },
    };

    if (startDate) {
      where.startTime = { ...where.startTime, gte: startDate };
    }

    if (endDate) {
      where.startTime = { ...where.startTime, lte: endDate };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take,
        orderBy: { startTime: 'desc' },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
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
          payments: {
            select: {
              id: true,
              amount: true,
              paymentMethod: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      success: true,
      appointments,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  } catch (error) {
    console.error('Error fetching client appointment history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch appointment history',
    };
  }
}

/**
 * Get service history for a client (aggregated by service)
 */
export async function getClientServiceHistory(filters: ClientHistoryFilters = {}) {
  try {
    const { clientProfileId, userId, startDate, endDate } = filters;

    if (!clientProfileId && !userId) {
      throw new Error('Either clientProfileId or userId must be provided');
    }

    // Get user ID from client profile if needed
    let targetUserId = userId;
    if (clientProfileId && !userId) {
      const profile = await prisma.clientProfile.findUnique({
        where: { id: clientProfileId },
        select: { userId: true },
      });
      if (!profile) {
        throw new Error('Client profile not found');
      }
      targetUserId = profile.userId;
    }

    // Find associated client records
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { tenantId: true, email: true, phone: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Find client records by phone or email
    const clients = await prisma.client.findMany({
      where: {
        tenantId: user.tenantId,
        OR: [
          { phone: user.phone || '' },
          { email: user.email },
        ],
      },
      select: { id: true },
    });

    const clientIds = clients.map((c) => c.id);

    const where: any = {
      clientId: { in: clientIds },
      status: 'COMPLETED',
    };

    if (startDate) {
      where.startTime = { ...where.startTime, gte: startDate };
    }

    if (endDate) {
      where.startTime = { ...where.startTime, lte: endDate };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      select: {
        serviceId: true,
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        startTime: true,
      },
    });

    // Aggregate by service
    const serviceMap = new Map<string, any>();

    appointments.forEach((appointment) => {
      const serviceId = appointment.serviceId;
      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          serviceId,
          serviceName: appointment.service.name,
          count: 0,
          lastVisit: appointment.startTime,
          totalSpent: 0,
        });
      }

      const serviceData = serviceMap.get(serviceId);
      serviceData.count += 1;
      serviceData.totalSpent += appointment.service.price;
      if (appointment.startTime > serviceData.lastVisit) {
        serviceData.lastVisit = appointment.startTime;
      }
    });

    const serviceHistory = Array.from(serviceMap.values()).sort((a, b) => b.count - a.count);

    return {
      success: true,
      serviceHistory,
      totalAppointments: appointments.length,
    };
  } catch (error) {
    console.error('Error fetching client service history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch service history',
    };
  }
}

/**
 * Get complete client history (appointments + services)
 */
export async function getCompleteClientHistory(filters: ClientHistoryFilters = {}) {
  try {
    const [appointmentHistory, serviceHistory] = await Promise.all([
      getClientAppointmentHistory(filters),
      getClientServiceHistory(filters),
    ]);

    if (!appointmentHistory.success || !serviceHistory.success) {
      throw new Error('Failed to fetch complete history');
    }

    return {
      success: true,
      appointmentHistory: appointmentHistory.appointments,
      serviceHistory: serviceHistory.serviceHistory,
      totalAppointments: serviceHistory.totalAppointments,
      pagination: appointmentHistory.pagination,
    };
  } catch (error) {
    console.error('Error fetching complete client history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch complete history',
    };
  }
}
