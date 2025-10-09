
/**
 * API Endpoint: Send Bulk Push Notifications
 * POST /api/notifications/push/send-bulk
 * 
 * Envía notificaciones push a múltiples usuarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { pushService } from '@/lib/services/pushService';
import { PrismaClient, NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

const MAX_USERS_PER_REQUEST = 1000;

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
    const { userIds, title, body: messageBody, icon, url, data } = body;

    // Validar datos requeridos
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'userIds debe ser un array no vacío' },
        { status: 400 }
      );
    }

    if (!title || !messageBody) {
      return NextResponse.json(
        { success: false, error: 'title y body son requeridos' },
        { status: 400 }
      );
    }

    // Limitar número de usuarios
    if (userIds.length > MAX_USERS_PER_REQUEST) {
      return NextResponse.json(
        { success: false, error: `Máximo ${MAX_USERS_PER_REQUEST} usuarios por request` },
        { status: 400 }
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

    // Obtener todas las subscripciones activas de los usuarios
    const allSubscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: { in: userIds },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (allSubscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ningún usuario tiene subscripciones activas' },
        { status: 404 }
      );
    }

    // Convertir a formato de subscripción
    const subscriptions = allSubscriptions.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    }));

    // Enviar notificaciones
    const results = await pushService.sendBulkPushNotifications(subscriptions, payload);

    // Crear logs de notificación por usuario
    const userSubscriptionMap = new Map<string, number>();
    allSubscriptions.forEach(sub => {
      const count = userSubscriptionMap.get(sub.userId) || 0;
      userSubscriptionMap.set(sub.userId, count + 1);
    });

    const logPromises = Array.from(userSubscriptionMap.entries()).map(([userId, count]) => {
      const user = allSubscriptions.find(s => s.userId === userId)?.user;
      
      return prisma.notificationLog.create({
        data: {
          type: NotificationType.REMINDER,
          channel: NotificationChannel.PUSH,
          recipientId: userId,
          recipientName: user?.name || 'Usuario',
          recipientContact: user?.email || '',
          subject: title,
          message: messageBody,
          status: NotificationStatus.SENT,
          metadata: JSON.stringify({
            subscriptions: count,
            bulkSend: true
          }),
          tenantId,
          sentAt: new Date()
        }
      });
    });

    await Promise.all(logPromises);

    // Marcar subscripciones fallidas como inactivas
    for (const result of results.results) {
      if (!result.result.success && result.result.error?.includes('expirada')) {
        await pushService.markSubscriptionInactive(result.subscription.endpoint);
      }
    }

    console.log(`✅ Push notifications masivas enviadas: ${results.sent}/${results.total} dispositivos`);

    return NextResponse.json({
      success: true,
      data: {
        users: userIds.length,
        devices: results.total,
        sent: results.sent,
        failed: results.failed
      }
    });

  } catch (error: any) {
    console.error('❌ Error enviando push notifications masivas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
