/**
 * API: Notification Statistics
 * 
 * GET /api/notifications/stats - Obtener estadísticas de notificaciones
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const where = {
      userId: session.user.id,
      tenantId: session.user.tenantId,
    };

    const [unreadCount, totalCount, recentCount] = await Promise.all([
      // Notificaciones no leídas
      prisma.notificationLog.count({
        where: {
          ...where,
          readAt: null,
        },
      }),

      // Total de notificaciones
      prisma.notificationLog.count({ where }),

      // Notificaciones de las últimas 24 horas
      prisma.notificationLog.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Conteo por tipo
    const byType = await prisma.notificationLog.groupBy({
      by: ['type'],
      where,
      _count: true,
    });

    return NextResponse.json({
      unreadCount,
      totalCount,
      recentCount,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
