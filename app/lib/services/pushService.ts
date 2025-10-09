
/**
 * Push Service
 * 
 * Servicio para enviar Web Push Notifications usando la API de Web Push
 */

import webPush from 'web-push';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: Record<string, any>;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface SendPushResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class PushService {
  private vapidConfigured: boolean = false;

  constructor() {
    this.configureVapid();
  }

  /**
   * Configura las credenciales VAPID
   */
  private configureVapid(): void {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@citaplanner.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('⚠️  Claves VAPID no configuradas. Las notificaciones push no funcionarán.');
      console.warn('   Ejecuta: npx ts-node scripts/generate-vapid-keys.ts');
      this.vapidConfigured = false;
      return;
    }

    webPush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    this.vapidConfigured = true;
    console.log('✅ VAPID configurado correctamente');
  }

  /**
   * Valida una subscripción
   */
  validateSubscription(subscription: PushSubscriptionData): boolean {
    if (!subscription || !subscription.endpoint) {
      return false;
    }

    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return false;
    }

    return true;
  }

  /**
   * Envía una notificación push a una subscripción específica
   */
  async sendPushNotification(
    subscription: PushSubscriptionData,
    payload: PushPayload
  ): Promise<SendPushResult> {
    if (!this.vapidConfigured) {
      return {
        success: false,
        error: 'VAPID no configurado'
      };
    }

    if (!this.validateSubscription(subscription)) {
      return {
        success: false,
        error: 'Subscripción inválida'
      };
    }

    try {
      // Preparar el payload
      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/badge-72x72.png',
        image: payload.image,
        tag: payload.tag || 'citaplanner-notification',
        requireInteraction: payload.requireInteraction || false,
        data: {
          url: payload.url || '/',
          timestamp: Date.now(),
          ...payload.data
        },
        actions: payload.actions
      });

      // Opciones de envío
      const options = {
        TTL: 60 * 60 * 24, // 24 horas
        urgency: 'normal' as const,
        topic: payload.tag || 'default'
      };

      // Enviar notificación
      const result = await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
          }
        },
        pushPayload,
        options
      );

      console.log('✅ Push notification enviada:', result.statusCode);

      return {
        success: true,
        messageId: `push-${Date.now()}`
      };

    } catch (error: any) {
      console.error('❌ Error enviando push notification:', error);

      // Manejar errores específicos
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscripción expirada o no encontrada
        return {
          success: false,
          error: 'Subscripción expirada o inválida'
        };
      }

      return {
        success: false,
        error: error.message || 'Error al enviar notificación push'
      };
    }
  }

  /**
   * Envía notificaciones push a múltiples subscripciones
   */
  async sendBulkPushNotifications(
    subscriptions: PushSubscriptionData[],
    payload: PushPayload
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
    results: Array<{ subscription: PushSubscriptionData; result: SendPushResult }>;
  }> {
    if (!this.vapidConfigured) {
      return {
        total: subscriptions.length,
        sent: 0,
        failed: subscriptions.length,
        results: subscriptions.map(sub => ({
          subscription: sub,
          result: { success: false, error: 'VAPID no configurado' }
        }))
      };
    }

    const results = await Promise.all(
      subscriptions.map(async (subscription) => {
        const result = await this.sendPushNotification(subscription, payload);
        return { subscription, result };
      })
    );

    const sent = results.filter(r => r.result.success).length;
    const failed = results.filter(r => !r.result.success).length;

    return {
      total: subscriptions.length,
      sent,
      failed,
      results
    };
  }

  /**
   * Obtiene subscripciones activas de un usuario
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscriptionData[]> {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true
      }
    });

    return subscriptions.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    }));
  }

  /**
   * Marca una subscripción como inactiva (expirada)
   */
  async markSubscriptionInactive(endpoint: string): Promise<void> {
    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false }
    });
  }

  /**
   * Limpia subscripciones inactivas antiguas
   */
  async cleanupInactiveSubscriptions(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.pushSubscription.deleteMany({
      where: {
        isActive: false,
        lastUsedAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`🧹 Limpiadas ${result.count} subscripciones inactivas`);
    return result.count;
  }
}

// Exportar instancia singleton
export const pushService = new PushService();
