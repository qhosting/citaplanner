
/**
 * Notification Service
 * 
 * Servicio centralizado para gestionar el envío de notificaciones
 * a través de múltiples canales (WhatsApp, Email, SMS, Push)
 */

import { PrismaClient, NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client';
import { evolutionApiService } from './evolutionApi';
import { pushService } from './pushService';
import { processTemplate } from '../utils/templateProcessor';

const prisma = new PrismaClient();

interface SendNotificationParams {
  type: NotificationType;
  channel: NotificationChannel;
  recipientId: string;
  templateId?: string;
  message?: string;
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface NotificationResult {
  success: boolean;
  logId?: string;
  messageId?: string;
  error?: string;
}

interface NotificationHistoryFilters {
  type?: NotificationType;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  recipientId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class NotificationService {
  /**
   * Envía una notificación a través del canal especificado
   */
  async sendNotification(params: SendNotificationParams): Promise<NotificationResult> {
    try {
      // 1. Obtener configuración de notificaciones
      const settings = await prisma.notificationSettings.findFirst();
      
      if (!settings) {
        return {
          success: false,
          error: 'Configuración de notificaciones no encontrada'
        };
      }

      // 2. Verificar si el canal está habilitado
      const channelEnabled = this.isChannelEnabled(params.channel, settings);
      if (!channelEnabled) {
        return {
          success: false,
          error: `Canal ${params.channel} no está habilitado`
        };
      }

      // 3. Obtener el destinatario
      const recipient = await this.getRecipient(params.recipientId);
      if (!recipient) {
        return {
          success: false,
          error: 'Destinatario no encontrado'
        };
      }

      // 4. Procesar el mensaje (plantilla o mensaje directo)
      let finalMessage = params.message || '';
      
      if (params.templateId) {
        const template = await prisma.notificationTemplate.findUnique({
          where: { id: params.templateId }
        });

        if (!template) {
          return {
            success: false,
            error: 'Plantilla no encontrada'
          };
        }

        finalMessage = processTemplate(template.message, params.variables || {});
      }

      // 5. Crear log de notificación (estado: PENDING)
      // Obtener tenant del usuario (por ahora usamos el primero)
      const tenant = await prisma.tenant.findFirst();
      if (!tenant) {
        return {
          success: false,
          error: 'Tenant no encontrado'
        };
      }

      const log = await prisma.notificationLog.create({
        data: {
          type: params.type,
          channel: params.channel,
          recipientId: params.recipientId,
          recipientName: `${recipient.firstName} ${recipient.lastName}`.trim(),
          recipientContact: this.getRecipientContact(recipient, params.channel),
          subject: params.variables?.subject || null,
          message: finalMessage,
          status: NotificationStatus.PENDING,
          metadata: JSON.stringify(params.metadata || {}),
          tenantId: tenant.id,
        }
      });

      // 6. Enviar notificación según el canal
      let sendResult: { success: boolean; messageId?: string; error?: string };

      switch (params.channel) {
        case NotificationChannel.WHATSAPP:
          sendResult = await this.sendWhatsApp(recipient, finalMessage, settings);
          break;
        case NotificationChannel.EMAIL:
          sendResult = await this.sendEmail(recipient, finalMessage, params.variables?.subject);
          break;
        case NotificationChannel.SMS:
          sendResult = await this.sendSMS(recipient, finalMessage);
          break;
        case NotificationChannel.PUSH:
          sendResult = await this.sendPush(recipient, finalMessage, params.variables);
          break;
        default:
          sendResult = {
            success: false,
            error: 'Canal no soportado'
          };
      }

      // 7. Actualizar log con el resultado
      await this.updateNotificationStatus(
        log.id,
        sendResult.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        {
          messageId: sendResult.messageId,
          error: sendResult.error,
          sentAt: sendResult.success ? new Date() : undefined,
        }
      );

      return {
        success: sendResult.success,
        logId: log.id,
        messageId: sendResult.messageId,
        error: sendResult.error,
      };

    } catch (error: any) {
      console.error('[NotificationService] Error al enviar notificación:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Envía notificaciones masivas
   */
  async sendBulkNotifications(
    recipientIds: string[],
    params: Omit<SendNotificationParams, 'recipientId'>
  ): Promise<{ total: number; sent: number; failed: number; results: NotificationResult[] }> {
    const results: NotificationResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const recipientId of recipientIds) {
      const result = await this.sendNotification({
        ...params,
        recipientId,
      });

      results.push(result);
      
      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Pequeño delay entre mensajes para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      total: recipientIds.length,
      sent,
      failed,
      results,
    };
  }

  /**
   * Actualiza el estado de una notificación
   */
  async updateNotificationStatus(
    logId: string,
    status: NotificationStatus,
    metadata?: Record<string, any>
  ): Promise<void> {
    const updateData: any = {
      status,
    };

    if (metadata) {
      updateData.metadata = JSON.stringify(metadata);
    }

    if (status === NotificationStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    if (status === NotificationStatus.READ) {
      updateData.readAt = new Date();
    }

    await prisma.notificationLog.update({
      where: { id: logId },
      data: updateData
    });
  }

  /**
   * Obtiene el historial de notificaciones con filtros
   */
  async getNotificationHistory(filters: NotificationHistoryFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.channel) where.channel = filters.channel;
    if (filters.status) where.status = filters.status;
    if (filters.recipientId) where.recipientId = filters.recipientId;
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            }
          },
          appointment: {
            select: {
              id: true,
              startTime: true,
            }
          },
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }),
      prisma.notificationLog.count({ where })
    ]);

    // Calcular estadísticas
    const stats = await prisma.notificationLog.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  private isChannelEnabled(channel: NotificationChannel, settings: any): boolean {
    switch (channel) {
      case NotificationChannel.WHATSAPP:
        return settings.whatsappEnabled;
      case NotificationChannel.EMAIL:
        return settings.emailEnabled;
      case NotificationChannel.SMS:
        return settings.smsEnabled;
      case NotificationChannel.PUSH:
        return settings.pushEnabled;
      default:
        return false;
    }
  }

  private async getRecipient(recipientId: string) {
    return await prisma.client.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      }
    });
  }

  private getRecipientContact(recipient: any, channel: NotificationChannel): string {
    switch (channel) {
      case NotificationChannel.WHATSAPP:
      case NotificationChannel.SMS:
        return recipient.phone || '';
      case NotificationChannel.EMAIL:
        return recipient.email || '';
      case NotificationChannel.PUSH:
        return recipient.id;
      default:
        return '';
    }
  }

  private async sendWhatsApp(recipient: any, message: string, settings: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!recipient.phone) {
      return { success: false, error: 'Cliente no tiene número de teléfono' };
    }

    // Configurar Evolution API con settings de la BD
    if (settings.evolutionApiUrl && settings.evolutionApiKey && settings.whatsappInstanceName) {
      evolutionApiService.setConfig({
        apiUrl: settings.evolutionApiUrl,
        apiKey: settings.evolutionApiKey,
        instanceName: settings.whatsappInstanceName,
      });
    }

    return await evolutionApiService.sendTextMessage({
      to: recipient.phone,
      message,
    });
  }

  private async sendEmail(recipient: any, message: string, subject?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // TODO: Implementar envío de email
    console.log('[NotificationService] Email no implementado aún');
    return { success: false, error: 'Email no implementado' };
  }

  private async sendSMS(recipient: any, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // TODO: Implementar envío de SMS
    console.log('[NotificationService] SMS no implementado aún');
    return { success: false, error: 'SMS no implementado' };
  }

  private async sendPush(recipient: any, message: string, variables?: Record<string, any>): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Obtener subscripciones activas del usuario
      const subscriptions = await pushService.getUserSubscriptions(recipient.id);

      if (subscriptions.length === 0) {
        return { success: false, error: 'Usuario no tiene subscripciones push activas' };
      }

      // Preparar payload
      const payload = {
        title: variables?.subject || 'CitaPlanner',
        body: message,
        icon: '/icon-192x192.png',
        url: variables?.url || '/',
        data: variables?.data || {}
      };

      // Enviar a todas las subscripciones del usuario
      const results = await pushService.sendBulkPushNotifications(subscriptions, payload);

      // Marcar subscripciones fallidas como inactivas
      for (const result of results.results) {
        if (!result.result.success && result.result.error?.includes('expirada')) {
          await pushService.markSubscriptionInactive(result.subscription.endpoint);
        }
      }

      if (results.sent > 0) {
        return {
          success: true,
          messageId: `push-${Date.now()}-${results.sent}`
        };
      } else {
        return {
          success: false,
          error: `No se pudo enviar a ningún dispositivo (${results.failed} fallidos)`
        };
      }

    } catch (error: any) {
      console.error('[NotificationService] Error enviando push:', error);
      return { success: false, error: error.message || 'Error al enviar push notification' };
    }
  }
}

// Instancia singleton
export const notificationService = new NotificationService();
