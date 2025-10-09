
/**
 * API: Historial de Notificaciones
 * 
 * GET /api/notifications/logs - Obtener historial con filtros
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client';
import { notificationService } from '@/lib/services/notificationService';

/**
 * GET - Obtener historial de notificaciones
 * 
 * Query params:
 * - type: NotificationType (opcional)
 * - channel: NotificationChannel (opcional)
 * - status: NotificationStatus (opcional)
 * - recipientId: string (opcional)
 * - startDate: ISO date string (opcional)
 * - endDate: ISO date string (opcional)
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Extraer filtros
    const filters: any = {};

    const type = searchParams.get('type');
    if (type && Object.values(NotificationType).includes(type as NotificationType)) {
      filters.type = type as NotificationType;
    }

    const channel = searchParams.get('channel');
    if (channel && Object.values(NotificationChannel).includes(channel as NotificationChannel)) {
      filters.channel = channel as NotificationChannel;
    }

    const status = searchParams.get('status');
    if (status && Object.values(NotificationStatus).includes(status as NotificationStatus)) {
      filters.status = status as NotificationStatus;
    }

    const recipientId = searchParams.get('recipientId');
    if (recipientId) {
      filters.recipientId = recipientId;
    }

    const startDate = searchParams.get('startDate');
    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    const endDate = searchParams.get('endDate');
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    filters.page = page;
    filters.limit = limit;

    // Obtener historial
    const result = await notificationService.getNotificationHistory(filters);

    return NextResponse.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
      stats: result.stats,
    });

  } catch (error: any) {
    console.error('[API] Error al obtener historial:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
