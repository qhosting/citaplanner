
import { prisma } from '@/lib/prisma';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { whatsAppService } from './whatsappService';
import { chatwootService } from './chatwootService';
import { NotificationType, NotificationStatus, NotificationChannel } from '@prisma/client';

export interface NotificationPayload {
  type: NotificationType;
  channel?: NotificationChannel; // Canal explícito (opcional para compatibilidad)
  recipient: string;
  subject?: string;
  message: string;
  tenantId: string;
  userId?: string;
  appointmentId?: string;
  recipientName?: string; // Nombre del destinatario
}

export interface TemplateVariables {
  clientName?: string;
  serviceName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  professionalName?: string;
  branchName?: string;
  price?: string;
  [key: string]: string | undefined;
}

export class NotificationManager {
  /**
   * Determina el canal de notificación basado en el tipo o canal explícito
   */
  private determineChannel(type: NotificationType, explicitChannel?: NotificationChannel): NotificationChannel {
    if (explicitChannel) {
      return explicitChannel;
    }

    // Inferir canal desde tipo para compatibilidad con código antiguo
    switch (type) {
      case NotificationType.EMAIL:
        return NotificationChannel.EMAIL;
      case NotificationType.SMS:
        return NotificationChannel.SMS;
      case NotificationType.WHATSAPP:
        return NotificationChannel.WHATSAPP;
      default:
        // Para tipos nuevos, usar un canal por defecto
        return NotificationChannel.EMAIL;
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<{ success: boolean; logId: string; error?: string }> {
    // Determinar canal
    const channel = this.determineChannel(payload.type, payload.channel);

    // Create notification log entry con campos actualizados
    const log = await prisma.notificationLog.create({
      data: {
        type: payload.type,
        channel: channel,
        recipientId: payload.userId || '',
        recipientName: payload.recipientName || 'Unknown',
        recipientContact: payload.recipient,
        subject: payload.subject,
        message: payload.message,
        status: NotificationStatus.PENDING,
        tenantId: payload.tenantId,
        userId: payload.userId,
        appointmentId: payload.appointmentId,
      },
    });

    let result: { success: boolean; messageId?: string; error?: string };

    try {
      // Switch basado en canal en lugar de tipo
      switch (channel) {
        case NotificationChannel.EMAIL:
          result = await emailService.sendEmail({
            to: payload.recipient,
            subject: payload.subject || 'Notificación CitaPlanner',
            html: payload.message,
          });
          break;

        case NotificationChannel.SMS:
          result = await smsService.sendSMS({
            to: payload.recipient,
            message: payload.message,
          });
          break;

        case NotificationChannel.WHATSAPP:
          result = await whatsAppService.sendWhatsApp({
            to: payload.recipient,
            message: payload.message,
          });
          break;

        case NotificationChannel.CHATWOOT:
          result = await chatwootService.sendChatwoot({
            to: payload.recipient,
            message: payload.message,
            tenantId: payload.tenantId,
            clientName: payload.recipientName,
          });
          break;

        default:
          result = { success: false, error: 'Invalid notification channel' };
      }

      // Update log with result
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
          error: result.error,
          sentAt: result.success ? new Date() : null,
        },
      });

      return {
        success: result.success,
        logId: log.id,
        error: result.error,
      };
    } catch (error: any) {
      // Update log with error
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: NotificationStatus.FAILED,
          error: error.message,
        },
      });

      return {
        success: false,
        logId: log.id,
        error: error.message,
      };
    }
  }

  async sendAppointmentNotification(
    appointmentId: string,
    type: NotificationType,
    templateName: string
  ): Promise<{ success: boolean; logId: string; error?: string }> {
    // Fetch appointment with all related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        service: true,
        user: true,
        branch: true,
        tenant: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Fetch template
    const template = await prisma.notificationTemplate.findFirst({
      where: {
        name: templateName,
        type,
        tenantId: appointment.tenantId,
        isActive: true,
      },
    });

    if (!template) {
      throw new Error(`Template '${templateName}' not found for type ${type}`);
    }

    // Prepare variables
    const variables: TemplateVariables = {
      clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
      serviceName: appointment.service.name,
      appointmentDate: appointment.startTime.toLocaleDateString('es-MX'),
      appointmentTime: appointment.startTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      professionalName: `${appointment.user.firstName} ${appointment.user.lastName}`,
      branchName: appointment.branch.name,
      price: `$${appointment.service.price}`,
    };

    // Replace variables in template
    let message = template.body;
    let subject = template.subject || '';

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), value || '');
      subject = subject.replace(new RegExp(placeholder, 'g'), value || '');
    });

    // Determine recipient and channel based on type
    let recipient = '';
    let channel: NotificationChannel | undefined;
    
    switch (type) {
      case NotificationType.EMAIL:
        recipient = appointment.client.email || '';
        channel = NotificationChannel.EMAIL;
        break;
      case NotificationType.SMS:
        recipient = appointment.client.phone;
        channel = NotificationChannel.SMS;
        break;
      case NotificationType.WHATSAPP:
        recipient = appointment.client.phone;
        channel = NotificationChannel.WHATSAPP;
        break;
      // Tipos de notificación que pueden usar cualquier canal
      case NotificationType.APPOINTMENT_CONFIRMATION:
      case NotificationType.APPOINTMENT_REMINDER:
      case NotificationType.APPOINTMENT_CANCELLATION:
      case NotificationType.APPOINTMENT_RESCHEDULE:
        // Por defecto usar teléfono y decidir canal después
        recipient = appointment.client.phone || appointment.client.email || '';
        // El canal puede especificarse al llamar esta función
        break;
    }

    if (!recipient) {
      throw new Error(`No contact available for client for ${type.toLowerCase()}`);
    }

    // Send notification
    return this.sendNotification({
      type,
      channel, // Canal explícito si se determinó
      recipient,
      subject,
      message,
      tenantId: appointment.tenantId,
      userId: appointment.client.id,
      appointmentId: appointment.id,
      recipientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
    });
  }

  /**
   * Envía una notificación de cita usando un canal específico
   */
  async sendAppointmentNotificationByChannel(
    appointmentId: string,
    type: NotificationType,
    channel: NotificationChannel,
    templateName: string
  ): Promise<{ success: boolean; logId: string; error?: string }> {
    // Similar a sendAppointmentNotification pero con canal explícito
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        service: true,
        user: true,
        branch: true,
        tenant: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Fetch template
    const template = await prisma.notificationTemplate.findFirst({
      where: {
        name: templateName,
        type,
        tenantId: appointment.tenantId,
        isActive: true,
      },
    });

    if (!template) {
      throw new Error(`Template '${templateName}' not found for type ${type}`);
    }

    // Prepare variables
    const variables: TemplateVariables = {
      clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
      serviceName: appointment.service.name,
      appointmentDate: appointment.startTime.toLocaleDateString('es-MX'),
      appointmentTime: appointment.startTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      professionalName: `${appointment.user.firstName} ${appointment.user.lastName}`,
      branchName: appointment.branch.name,
      price: `$${appointment.service.price}`,
    };

    // Replace variables in template
    let message = template.body;
    let subject = template.subject || '';

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), value || '');
      subject = subject.replace(new RegExp(placeholder, 'g'), value || '');
    });

    // Determine recipient based on channel
    let recipient = '';
    switch (channel) {
      case NotificationChannel.EMAIL:
        recipient = appointment.client.email || '';
        break;
      case NotificationChannel.SMS:
      case NotificationChannel.WHATSAPP:
      case NotificationChannel.CHATWOOT:
        recipient = appointment.client.phone;
        break;
    }

    if (!recipient) {
      throw new Error(`No ${channel.toLowerCase()} contact available for client`);
    }

    // Send notification with explicit channel
    return this.sendNotification({
      type,
      channel,
      recipient,
      subject,
      message,
      tenantId: appointment.tenantId,
      userId: appointment.client.id,
      appointmentId: appointment.id,
      recipientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
    });
  }

  async testAllChannels(tenantId: string): Promise<{
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    chatwoot: boolean;
  }> {
    return {
      email: await emailService.testConnection(),
      sms: await smsService.testConnection(),
      whatsapp: await whatsAppService.testConnection(),
      chatwoot: await chatwootService.testConnection(tenantId),
    };
  }

  replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value || '');
    });
    return result;
  }
}

export const notificationManager = new NotificationManager();
