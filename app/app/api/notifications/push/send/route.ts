
/**
 * API Endpoint: Send Push Notification
 * POST /api/notifications/push/send
 * 
 * Envía una notificación push a un usuario específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { pushService } from '@/lib/services/pushService';
import { PrismaClient, NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const tenantId = (session.user as any).tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant no encontrado' },
        { status: 400 }
      );
    }

    // Parsear body
    const body = await req.json();
    const { userId, title, body: messageBody, icon, url, data } = body;

    // Validar datos requeridos
    if (!userId || !title || !messageBody) {
      return NextResponse.json(
        { success: false, error: 'userId, title y body son requeridos' },
        { status: 400 }
      );
    }

    // Obtener subscripciones activas del usuario
    const subscriptions = await pushService.getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuario no tiene subscripciones activas' },
        { status: 404 }
      );
    }

    // Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Preparar payload
    const payload = {
      title,
      body: messageBody,
      icon: icon || '/icon-192x192.png',
      url: url || '/',
      data: data || {}
    };

    // Enviar a todas las subscripciones del usuario
    const results = await pushService.sendBulkPushNotifications(subscriptions, payload);

    // Crear log de notificación
    const log = await prisma.notificationLog.create({
      data: {
        type: NotificationType.REMINDER,
        channel: NotificationChannel.PUSH,
        recipientId: userId,
        recipientName: user.name || 'Usuario',
        recipientContact: user.email || '',
        subject: title,
        message: messageBody,
        status: results.sent > 0 ? NotificationStatus.SENT : NotificationStatus.FAILED,
        metadata: JSON.stringify({
          subscriptions: results.total,
          sent: results.sent,
          failed: results.failed
        }),
        tenantId,
        sentAt: results.sent > 0 ? new Date() : null
      }
    });

    // Marcar subscripciones fallidas como inactivas
    for (const result of results.results) {
      if (!result.result.success && result.result.error?.includes('expirada')) {
        await pushService.markSubscriptionInactive(result.subscription.endpoint);
      }
    }

    console.log(`✅ Push notification enviada a ${results.sent}/${results.total} dispositivos`);

    return NextResponse.json({
      success: true,
      data: {
        logId: log.id,
        total: results.total,
        sent: results.sent,
        failed: results.failed
      }
    });

  } catch (error: any) {
    console.error('❌ Error enviando push notification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
