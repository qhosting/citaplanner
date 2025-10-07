
import { prisma } from '@/lib/prisma';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { whatsAppService } from './whatsappService';
import { NotificationType, NotificationStatus } from '@prisma/client';

export interface NotificationPayload {
  type: NotificationType;
  recipient: string;
  subject?: string;
  message: string;
  tenantId: string;
  userId?: string;
  appointmentId?: string;
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
  async sendNotification(payload: NotificationPayload): Promise<{ success: boolean; logId: string; error?: string }> {
    // Create notification log entry
    const log = await prisma.notificationLog.create({
      data: {
        type: payload.type,
        recipient: payload.recipient,
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
      switch (payload.type) {
        case NotificationType.EMAIL:
          result = await emailService.sendEmail({
            to: payload.recipient,
            subject: payload.subject || 'Notificación CitaPlanner',
            html: payload.message,
          });
          break;

        case NotificationType.SMS:
          result = await smsService.sendSMS({
            to: payload.recipient,
            message: payload.message,
          });
          break;

        case NotificationType.WHATSAPP:
          result = await whatsAppService.sendWhatsApp({
            to: payload.recipient,
            message: payload.message,
          });
          break;

        default:
          result = { success: false, error: 'Invalid notification type' };
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

    // Determine recipient
    let recipient = '';
    switch (type) {
      case NotificationType.EMAIL:
        recipient = appointment.client.email || '';
        break;
      case NotificationType.SMS:
      case NotificationType.WHATSAPP:
        recipient = appointment.client.phone;
        break;
    }

    if (!recipient) {
      throw new Error(`No ${type.toLowerCase()} contact available for client`);
    }

    // Send notification
    return this.sendNotification({
      type,
      recipient,
      subject,
      message,
      tenantId: appointment.tenantId,
      userId: appointment.client.id,
      appointmentId: appointment.id,
    });
  }

  async testAllChannels(tenantId: string): Promise<{
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  }> {
    return {
      email: await emailService.testConnection(),
      sms: await smsService.testConnection(),
      whatsapp: await whatsAppService.testConnection(),
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
