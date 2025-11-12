/**
 * API: Notifications Management
 * 
 * GET /api/notifications - Obtener notificaciones del usuario
 * POST /api/notifications/read-all - Marcar todas como leídas
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationType, NotificationStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unread = searchParams.get('unread') === 'true';
    const type = searchParams.get('type') as NotificationType | null;

    const where: any = {
      userId: session.user.id,
      tenantId: session.user.tenantId,
    };

    if (unread) {
      where.readAt = null;
    }

    if (type) {
      where.type = type;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          channel: true,
          message: true,
          metadata: true,
          status: true,
          readAt: true,
          createdAt: true,
          appointmentId: true,
        },
      }),
      prisma.notificationLog.count({ where }),
    ]);

    // Parse metadata JSON
    const notificationsWithParsedMetadata = notifications.map((notif) => ({
      ...notif,
      metadata: notif.metadata ? JSON.parse(notif.metadata) : null,
    }));

    return NextResponse.json({
      notifications: notificationsWithParsedMetadata,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await req.json();

    if (action === 'read-all') {
      // Marcar todas las notificaciones como leídas
      const result = await prisma.notificationLog.updateMany({
        where: {
          userId: session.user.id,
          tenantId: session.user.tenantId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        count: result.count,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in notifications POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
