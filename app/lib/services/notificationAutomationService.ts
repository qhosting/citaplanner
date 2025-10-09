
/**
 * Notification Automation Service
 * 
 * Servicio para automatizar el envío de notificaciones basadas en eventos
 * del sistema de citas (creación, modificación, cancelación, recordatorios)
 */

import { PrismaClient, NotificationType, NotificationChannel, AppointmentStatus } from '@prisma/client';
import { NotificationService } from './notificationService';
import { hasRecentNotification } from '../utils/notificationDeduplication';

const prisma = new PrismaClient();
const notificationService = new NotificationService();

interface AppointmentData {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
  };
  service: {
    name: string;
    duration: number;
    price: number;
  };
  user: {
    firstName: string;
    lastName: string;
  };
  branch: {
    name: string;
  };
}

export class NotificationAutomationService {
  /**
   * Envía confirmación de cita recién creada
   */
  async sendAppointmentConfirmation(appointmentId: string): Promise<void> {
    try {
      console.log(`[NotificationAutomation] Enviando confirmación para cita ${appointmentId}`);

      const appointment = await this.getAppointmentWithDetails(appointmentId);
      if (!appointment) {
        console.error(`[NotificationAutomation] Cita ${appointmentId} no encontrada`);
        return;
      }

      // Verificar configuración de notificaciones
      const settings = await prisma.notificationSettings.findFirst({
        where: { tenantId: appointment.tenantId }
      });

      if (!settings) {
        console.log('[NotificationAutomation] Configuración de notificaciones no encontrada');
        return;
      }

      // Verificar duplicados (no enviar si ya se envió en las últimas 2 horas)
      const isDuplicate = await hasRecentNotification(
        NotificationType.APPOINTMENT_CONFIRMATION,
        appointment.client.id,
        appointmentId,
        2
      );

      if (isDuplicate) {
        console.log(`[NotificationAutomation] Confirmación ya enviada recientemente para cita ${appointmentId}`);
        return;
      }

      // Preparar variables para la plantilla
      const variables = {
        clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
        serviceName: appointment.service.name,
        appointmentDate: this.formatDate(appointment.startTime),
        appointmentTime: this.formatTime(appointment.startTime),
        professionalName: `${appointment.user.firstName} ${appointment.user.lastName}`,
        branchName: appointment.branch.name,
        duration: `${appointment.service.duration} minutos`,
        price: `$${appointment.service.price.toFixed(2)}`,
      };

      // Obtener plantilla de confirmación
      const template = await prisma.notificationTemplate.findFirst({
        where: {
          tenantId: appointment.tenantId,
          type: NotificationType.APPOINTMENT_CONFIRMATION,
          isActive: true,
        },
        orderBy: {
          isDefault: 'desc',
        },
      });

      // Enviar por WhatsApp si está habilitado
      if (settings.whatsappEnabled && appointment.client.phone) {
        await notificationService.sendNotification({
          type: NotificationType.APPOINTMENT_CONFIRMATION,
          channel: NotificationChannel.WHATSAPP,
          recipientId: appointment.client.id,
          templateId: template?.id,
          variables,
          metadata: { appointmentId },
        });
      }

      // Enviar por Push si está habilitado
      if (settings.pushEnabled) {
        await notificationService.sendNotification({
          type: NotificationType.APPOINTMENT_CONFIRMATION,
          channel: NotificationChannel.PUSH,
          recipientId: appointment.client.id,
          templateId: template?.id,
          variables: {
            ...variables,
            title: 'Cita Confirmada',
          },
          metadata: { appointmentId },
        });
      }

      // Enviar por Email si está habilitado
      if (settings.emailEnabled && appointment.client.email) {
        await notificationService.sendNotification({
          type: NotificationType.APPOINTMENT_CONFIRMATION,
          channel: NotificationChannel.EMAIL,
          recipientId: appointment.client.id,
          templateId: template?.id,
          variables: {
            ...variables,
            subject: 'Confirmación de Cita',
          },
          metadata: { appointmentId },
        });
      }

      // Marcar notificaciones como enviadas
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { notificationsSent: true },
      });

      console.log(`[NotificationAutomation] Confirmación enviada exitosamente para cita ${appointmentId}`);
    } catch (error: any) {
      console.error('[NotificationAutomation] Error al enviar confirmación:', error);
    }
  }

  /**
   * Envía recordatorios de citas próximas
   * Se ejecuta periódicamente (cada hora) para verificar citas que necesitan recordatorio
   */
  async sendAppointmentReminders(): Promise<{ sent: number; failed: number; skipped: number }> {
    try {
      console.log('[NotificationAutomation] Iniciando envío de recordatorios...');

      let sent = 0;
      let failed = 0;
      let skipped = 0;

      // Obtener todas las configuraciones de notificaciones activas
      const allSettings = await prisma.notificationSettings.findMany({
        where: {
          appointmentReminderEnabled: true,
        },
        include: {
          tenant: true,
        },
      });

      for (const settings of allSettings) {
        // Parsear tiempos de recordatorio (en minutos antes de la cita)
        let reminderTimes: number[] = [1440, 60]; // Default: 24h y 1h antes
        
        if (settings.appointmentReminderTimes) {
          try {
            reminderTimes = JSON.parse(settings.appointmentReminderTimes);
          } catch (e) {
            console.error('[NotificationAutomation] Error al parsear reminderTimes:', e);
          }
        }

        // Para cada tiempo de recordatorio
        for (const minutesBefore of reminderTimes) {
          const targetTime = new Date();
          targetTime.setMinutes(targetTime.getMinutes() + minutesBefore);

          // Buscar citas que coincidan con este tiempo (±15 minutos de margen)
          const startWindow = new Date(targetTime);
          startWindow.setMinutes(startWindow.getMinutes() - 15);
          
          const endWindow = new Date(targetTime);
          endWindow.setMinutes(endWindow.getMinutes() + 15);

          const appointments = await prisma.appointment.findMany({
            where: {
              tenantId: settings.tenantId,
              startTime: {
                gte: startWindow,
                lte: endWindow,
              },
              status: {
                in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
              },
            },
            include: {
              client: true,
              service: true,
              user: true,
              branch: true,
            },
          });

          console.log(`[NotificationAutomation] Encontradas ${appointments.length} citas para recordatorio de ${minutesBefore} minutos`);

          // Enviar recordatorio para cada cita
          for (const appointment of appointments) {
            try {
              // Verificar duplicados (no enviar si ya se envió en las últimas 6 horas)
              const isDuplicate = await hasRecentNotification(
                NotificationType.APPOINTMENT_REMINDER,
                appointment.client.id,
                appointment.id,
                6
              );

              if (isDuplicate) {
                console.log(`[NotificationAutomation] Recordatorio ya enviado para cita ${appointment.id}`);
                skipped++;
                continue;
              }

              // Preparar variables
              const variables = {
                clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
                serviceName: appointment.service.name,
                appointmentDate: this.formatDate(appointment.startTime),
                appointmentTime: this.formatTime(appointment.startTime),
                professionalName: `${appointment.user.firstName} ${appointment.user.lastName}`,
                branchName: appointment.branch.name,
                timeUntil: this.formatTimeUntil(minutesBefore),
              };

              // Obtener plantilla
              const template = await prisma.notificationTemplate.findFirst({
                where: {
                  tenantId: settings.tenantId,
                  type: NotificationType.APPOINTMENT_REMINDER,
                  isActive: true,
                },
                orderBy: {
                  isDefault: 'desc',
                },
              });

              // Enviar por canales habilitados
              let sentAny = false;

              if (settings.whatsappEnabled && appointment.client.phone) {
                const result = await notificationService.sendNotification({
                  type: NotificationType.APPOINTMENT_REMINDER,
                  channel: NotificationChannel.WHATSAPP,
                  recipientId: appointment.client.id,
                  templateId: template?.id,
                  variables,
                  metadata: { appointmentId: appointment.id, minutesBefore },
                });
                if (result.success) sentAny = true;
              }

              if (settings.pushEnabled) {
                const result = await notificationService.sendNotification({
                  type: NotificationType.APPOINTMENT_REMINDER,
                  channel: NotificationChannel.PUSH,
                  recipientId: appointment.client.id,
                  templateId: template?.id,
                  variables: {
                    ...variables,
                    title: 'Recordatorio de Cita',
                  },
                  metadata: { appointmentId: appointment.id, minutesBefore },
                });
                if (result.success) sentAny = true;
              }

              if (sentAny) {
                sent++;
                console.log(`[NotificationAutomation] Recordatorio enviado para cita ${appointment.id}`);
              } else {
                failed++;
              }
            } catch (error: any) {
              console.error(`[NotificationAutomation] Error al enviar recordatorio para cita ${appointment.id}:`, error);
              failed++;
            }
          }
        }
      }

      console.log(`[NotificationAutomation] Recordatorios completados: ${sent} enviados, ${failed} fallidos, ${skipped} omitidos`);
      return { sent, failed, skipped };
    } catch (error: any) {
      console.error('[NotificationAutomation] Error al enviar recordatorios:', error);
      return { sent: 0, failed: 0, skipped: 0 };
    }
  }

  /**
   * Envía notificación de reprogramación de cita
   */
  async sendAppointmentRescheduleNotification(
    appointmentId: string,
    oldStartTime: Date,
    newStartTime: Date
  ): Promise<void> {
    try {
      console.log(`[NotificationAutomation] Enviando notificación de reprogramación para cita ${appointmentId}`);

      const appointment = await this.getAppointmentWithDetails(appointmentId);
      if (!appointment) {
        console.error(`[NotificationAutomation] Cita ${appointmentId} no encontrada`);
        return;
      }

      const settings = await prisma.notificationSettings.findFirst({
        where: { tenantId: appointment.tenantId }
      });

      if (!settings) {
        console.log('[NotificationAutomation] Configuración de notificaciones no encontrada');
        return;
      }

      // Verificar duplicados
      const isDuplicate = await hasRecentNotification(
        NotificationType.APPOINTMENT_RESCHEDULE,
        appointment.client.id,
        appointmentId,
        1
      );

      if (isDuplicate) {
        console.log(`[NotificationAutomation] Notificación de reprogramación ya enviada para cita ${appointmentId}`);
        return;
      }

      const variables = {
        clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
        serviceName: appointment.service.name,
        oldDate: this.formatDate(oldStartTime),
        oldTime: this.formatTime(oldStartTime),
        newDate: this.formatDate(newStartTime),
        newTime: this.formatTime(newStartTime),
        professionalName: `${appointment.user.firstName} ${appointment.user.lastName}`,
        branchName: appointment.branch.name,
      };

      const template = await prisma.notificationTemplate.findFirst({
        where: {
          tenantId: appointment.tenantId,
          type: NotificationType.APPOINTMENT_RESCHEDULE,
          isActive: true,
        },
        orderBy: {
          isDefault: 'desc',
        },
      });

      // Enviar por canales habilitados
      if (settings.whatsappEnabled && appointment.client.phone) {
        await notificationService.sendNotification({
          type: NotificationType.APPOINTMENT_RESCHEDULE,
          channel: NotificationChannel.WHATSAPP,
          recipientId: appointment.client.id,
          templateId: template?.id,
          variables,
          metadata: { appointmentId, oldStartTime: oldStartTime.toISOString(), newStartTime: newStartTime.toISOString() },
        });
      }

      if (settings.pushEnabled) {
        await notificationService.sendNotification({
          type: NotificationType.APPOINTMENT_RESCHEDULE,
          channel: NotificationChannel.PUSH,
          recipientId: appointment.client.id,
          templateId: template?.id,
          variables: {
            ...variables,
            title: 'Cita Reprogramada',
          },
          metadata: { appointmentId, oldStartTime: oldStartTime.toISOString(), newStartTime: newStartTime.toISOString() },
        });
      }

      console.log(`[NotificationAutomation] Notificación de reprogramación enviada para cita ${appointmentId}`);
    } catch (error: any) {
      console.error('[NotificationAutomation] Error al enviar notificación de reprogramación:', error);
    }
  }

  /**
   * Envía notificación de cancelación de cita
   */
  async sendAppointmentCancellationNotification(appointmentId: string): Promise<void> {
    try {
      console.log(`[NotificationAutomation] Enviando notificación de cancelación para cita ${appointmentId}`);

      const appointment = await this.getAppointmentWithDetails(appointmentId);
      if (!appointment) {
        console.error(`[NotificationAutomation] Cita ${appointmentId} no encontrada`);
        return;
      }

      const settings = await prisma.notificationSettings.findFirst({
        where: { tenantId: appointment.tenantId }
      });

      if (!settings) {
        console.log('[NotificationAutomation] Configuración de notificaciones no encontrada');
        return;
      }

      // Verificar duplicados
      const isDuplicate = await hasRecentNotification(
        NotificationType.APPOINTMENT_CANCELLATION,
        appointment.client.id,
        appointmentId,
        1
      );

      if (isDuplicate) {
        console.log(`[NotificationAutomation] Notificación de cancelación ya enviada para cita ${appointmentId}`);
        return;
      }

      const variables = {
        clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
        serviceName: appointment.service.name,
        appointmentDate: this.formatDate(appointment.startTime),
        appointmentTime: this.formatTime(appointment.startTime),
        professionalName: `${appointment.user.firstName} ${appointment.user.lastName}`,
        branchName: appointment.branch.name,
      };

      const template = await prisma.notificationTemplate.findFirst({
        where: {
          tenantId: appointment.tenantId,
          type: NotificationType.APPOINTMENT_CANCELLATION,
          isActive: true,
        },
        orderBy: {
          isDefault: 'desc',
        },
      });

      // Enviar por canales habilitados
      if (settings.whatsappEnabled && appointment.client.phone) {
        await notificationService.sendNotification({
          type: NotificationType.APPOINTMENT_CANCELLATION,
          channel: NotificationChannel.WHATSAPP,
          recipientId: appointment.client.id,
          templateId: template?.id,
          variables,
          metadata: { appointmentId },
        });
      }

      if (settings.pushEnabled) {
        await notificationService.sendNotification({
          type: NotificationType.APPOINTMENT_CANCELLATION,
          channel: NotificationChannel.PUSH,
          recipientId: appointment.client.id,
          templateId: template?.id,
          variables: {
            ...variables,
            title: 'Cita Cancelada',
          },
          metadata: { appointmentId },
        });
      }

      console.log(`[NotificationAutomation] Notificación de cancelación enviada para cita ${appointmentId}`);
    } catch (error: any) {
      console.error('[NotificationAutomation] Error al enviar notificación de cancelación:', error);
    }
  }

  /**
   * Envía recordatorio de pago pendiente
   */
  async sendPaymentReminder(saleId: string): Promise<void> {
    try {
      console.log(`[NotificationAutomation] Enviando recordatorio de pago para venta ${saleId}`);

      const sale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          client: true,
          saleItems: true,
        },
      });

      if (!sale || !sale.client) {
        console.error(`[NotificationAutomation] Venta ${saleId} no encontrada o sin cliente`);
        return;
      }

      const settings = await prisma.notificationSettings.findFirst({
        where: { tenantId: sale.tenantId }
      });

      if (!settings) {
        console.log('[NotificationAutomation] Configuración de notificaciones no encontrada');
        return;
      }

      // Verificar duplicados
      const isDuplicate = await hasRecentNotification(
        NotificationType.PAYMENT_REMINDER,
        sale.client.id,
        saleId,
        24 // No enviar más de una vez al día
      );

      if (isDuplicate) {
        console.log(`[NotificationAutomation] Recordatorio de pago ya enviado para venta ${saleId}`);
        return;
      }

      const variables = {
        clientName: `${sale.client.firstName} ${sale.client.lastName}`,
        saleId: sale.saleNumber,
        totalAmount: `$${sale.total.toFixed(2)}`,
        subtotal: `$${sale.subtotal.toFixed(2)}`,
        discount: `$${sale.discount.toFixed(2)}`,
        tax: `$${sale.tax.toFixed(2)}`,
        saleDate: this.formatDate(sale.saleDate),
        paymentMethod: sale.paymentMethod,
      };

      const template = await prisma.notificationTemplate.findFirst({
        where: {
          tenantId: sale.tenantId,
          type: NotificationType.PAYMENT_REMINDER,
          isActive: true,
        },
        orderBy: {
          isDefault: 'desc',
        },
      });

      // Enviar por canales habilitados
      if (settings.whatsappEnabled && sale.client.phone) {
        await notificationService.sendNotification({
          type: NotificationType.PAYMENT_REMINDER,
          channel: NotificationChannel.WHATSAPP,
          recipientId: sale.client.id,
          templateId: template?.id,
          variables,
          metadata: { saleId },
        });
      }

      if (settings.pushEnabled) {
        await notificationService.sendNotification({
          type: NotificationType.PAYMENT_REMINDER,
          channel: NotificationChannel.PUSH,
          recipientId: sale.client.id,
          templateId: template?.id,
          variables: {
            ...variables,
            title: 'Recordatorio de Pago',
          },
          metadata: { saleId },
        });
      }

      console.log(`[NotificationAutomation] Recordatorio de pago enviado para venta ${saleId}`);
    } catch (error: any) {
      console.error('[NotificationAutomation] Error al enviar recordatorio de pago:', error);
    }
  }

  // Métodos auxiliares privados

  private async getAppointmentWithDetails(appointmentId: string): Promise<any> {
    return await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        service: true,
        user: true,
        branch: true,
        tenant: true,
      },
    });
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private formatTimeUntil(minutes: number): string {
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      return `${days} día${days > 1 ? 's' : ''}`;
    } else if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
  }
}

export const notificationAutomationService = new NotificationAutomationService();
