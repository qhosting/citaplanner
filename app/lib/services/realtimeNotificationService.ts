/**
 * Real-Time Notification Service
 * 
 * Servicio para emitir notificaciones en tiempo real a través de WebSocket
 */

import { emitToTenant, emitToUser, emitToRole } from '@/lib/socket/server';
import { prisma } from '@/lib/prisma';
import { Appointment, User, Service, Branch, Client } from '@prisma/client';

export interface RealtimeNotification {
  id: string;
  type: string;
  message: string;
  data?: any;
  userId?: string;
  tenantId: string;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

type AppointmentWithRelations = Appointment & {
  user: User;
  service: Service;
  branch: Branch;
  client: Client;
};

class RealtimeNotificationService {
  /**
   * Crear y emitir una notificación en tiempo real
   */
  private async createAndEmitNotification(
    tenantId: string,
    type: string,
    message: string,
    data?: any,
    targetUserId?: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string> {
    // Crear registro en la base de datos
    const notification = await prisma.notificationLog.create({
      data: {
        type: type as any,
        channel: 'PUSH',
        recipientId: targetUserId || tenantId,
        recipientName: 'Sistema',
        recipientContact: '',
        message,
        status: 'SENT',
        sentAt: new Date(),
        tenantId,
        userId: targetUserId,
        metadata: JSON.stringify({
          isRealtime: true,
          eventType: type,
          eventData: data,
          priority,
        }),
      },
    });

    const realtimeNotification: RealtimeNotification = {
      id: notification.id,
      type,
      message,
      data,
      userId: targetUserId,
      tenantId,
      createdAt: notification.createdAt,
      priority,
    };

    // Emitir a través de WebSocket
    if (targetUserId) {
      emitToUser(targetUserId, 'notification:new', realtimeNotification);
    } else {
      emitToTenant(tenantId, 'notification:new', realtimeNotification);
    }

    return notification.id;
  }

  /**
   * Notificar creación de cita
   */
  async broadcastAppointmentCreated(
    appointment: AppointmentWithRelations,
    createdByUserId: string
  ): Promise<void> {
    const message = `Nueva cita: ${appointment.client.firstName} ${appointment.client.lastName} - ${appointment.service.name}`;
    
    const data = {
      appointmentId: appointment.id,
      clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
      serviceName: appointment.service.name,
      professionalName: `${appointment.user.firstName} ${appointment.user.lastName}`,
      branchName: appointment.branch.name,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      createdBy: createdByUserId,
    };

    // Notificar al tenant completo
    emitToTenant(appointment.tenantId, 'appointment:created', {
      appointment: data,
      createdBy: createdByUserId,
      timestamp: new Date(),
    });

    // Crear notificación para el profesional asignado
    await this.createAndEmitNotification(
      appointment.tenantId,
      'appointment:created',
      message,
      data,
      appointment.userId,
      'high'
    );
  }

  /**
   * Notificar actualización de cita
   */
  async broadcastAppointmentUpdated(
    appointment: AppointmentWithRelations,
    updatedByUserId: string,
    changes: Record<string, any>
  ): Promise<void> {
    const message = `Cita actualizada: ${appointment.client.firstName} ${appointment.client.lastName}`;
    
    const data = {
      appointmentId: appointment.id,
      clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
      serviceName: appointment.service.name,
      professionalName: `${appointment.user.firstName} ${appointment.user.lastName}`,
      branchName: appointment.branch.name,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      updatedBy: updatedByUserId,
      changes,
    };

    // Notificar al tenant completo
    emitToTenant(appointment.tenantId, 'appointment:updated', {
      appointment: data,
      updatedBy: updatedByUserId,
      changes,
      timestamp: new Date(),
    });

    // Crear notificación para el profesional asignado (si no fue él quien actualizó)
    if (appointment.userId !== updatedByUserId) {
      await this.createAndEmitNotification(
        appointment.tenantId,
        'appointment:updated',
        message,
        data,
        appointment.userId,
        'medium'
      );
    }
  }

  /**
   * Notificar eliminación de cita
   */
  async broadcastAppointmentDeleted(
    appointmentId: string,
    tenantId: string,
    deletedByUserId: string,
    appointmentData: any
  ): Promise<void> {
    const message = `Cita cancelada: ${appointmentData.clientName}`;

    // Notificar al tenant completo
    emitToTenant(tenantId, 'appointment:deleted', {
      appointmentId,
      appointmentData,
      deletedBy: deletedByUserId,
      timestamp: new Date(),
    });

    // Crear notificación para el profesional
    if (appointmentData.professionalId) {
      await this.createAndEmitNotification(
        tenantId,
        'appointment:deleted',
        message,
        appointmentData,
        appointmentData.professionalId,
        'high'
      );
    }
  }

  /**
   * Notificar reprogramación de cita
   */
  async broadcastAppointmentRescheduled(
    appointment: AppointmentWithRelations,
    oldStartTime: Date,
    oldEndTime: Date,
    rescheduledByUserId: string
  ): Promise<void> {
    const message = `Cita reprogramada: ${appointment.client.firstName} ${appointment.client.lastName}`;
    
    const data = {
      appointmentId: appointment.id,
      clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
      serviceName: appointment.service.name,
      professionalName: `${appointment.user.firstName} ${appointment.user.lastName}`,
      oldStartTime,
      oldEndTime,
      newStartTime: appointment.startTime,
      newEndTime: appointment.endTime,
      rescheduledBy: rescheduledByUserId,
    };

    // Notificar al tenant completo
    emitToTenant(appointment.tenantId, 'appointment:rescheduled', {
      appointment: data,
      oldTime: { start: oldStartTime, end: oldEndTime },
      newTime: { start: appointment.startTime, end: appointment.endTime },
      rescheduledBy: rescheduledByUserId,
      timestamp: new Date(),
    });

    // Crear notificación para el profesional
    await this.createAndEmitNotification(
      appointment.tenantId,
      'appointment:rescheduled',
      message,
      data,
      appointment.userId,
      'high'
    );
  }

  /**
   * Notificar actualización de horarios
   */
  async broadcastScheduleUpdated(
    professionalId: string,
    tenantId: string,
    updatedByUserId: string,
    scheduleData: any
  ): Promise<void> {
    const message = 'Horarios actualizados';

    // Notificar al tenant
    emitToTenant(tenantId, 'schedule:updated', {
      professionalId,
      schedule: scheduleData,
      updatedBy: updatedByUserId,
      timestamp: new Date(),
    });

    // Notificar al profesional
    await this.createAndEmitNotification(
      tenantId,
      'schedule:updated',
      message,
      scheduleData,
      professionalId,
      'medium'
    );
  }

  /**
   * Solicitar refresco de calendario
   */
  async broadcastCalendarRefresh(
    tenantId: string,
    reason: string,
    affectedDates?: Date[]
  ): Promise<void> {
    emitToTenant(tenantId, 'calendar:refresh', {
      reason,
      affectedDates,
      timestamp: new Date(),
    });
  }

  /**
   * Notificar alerta del sistema
   */
  async broadcastSystemAlert(
    tenantId: string,
    message: string,
    severity: 'info' | 'warning' | 'error',
    data?: any,
    targetRole?: string
  ): Promise<void> {
    const notification: RealtimeNotification = {
      id: Date.now().toString(),
      type: 'system:alert',
      message,
      data: { ...data, severity },
      tenantId,
      createdAt: new Date(),
      priority: severity === 'error' ? 'urgent' : 'medium',
    };

    if (targetRole) {
      emitToRole(targetRole, tenantId, 'system:alert', notification);
    } else {
      emitToTenant(tenantId, 'system:alert', notification);
    }

    // Guardar en base de datos
    await this.createAndEmitNotification(
      tenantId,
      'system:alert',
      message,
      { ...data, severity },
      undefined,
      notification.priority
    );
  }

  /**
   * Notificar recordatorio de cita
   */
  async sendAppointmentReminder(
    appointment: AppointmentWithRelations,
    minutesBefore: number
  ): Promise<void> {
    const message = `Recordatorio: Tienes una cita en ${minutesBefore} minutos`;
    
    const data = {
      appointmentId: appointment.id,
      clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
      serviceName: appointment.service.name,
      startTime: appointment.startTime,
      minutesBefore,
    };

    // Notificar al profesional
    await this.createAndEmitNotification(
      appointment.tenantId,
      'appointment:reminder',
      message,
      data,
      appointment.userId,
      'high'
    );

    // También notificar al cliente si tiene userId
    if (appointment.client.id) {
      await this.createAndEmitNotification(
        appointment.tenantId,
        'appointment:reminder',
        `Recordatorio: Tu cita es en ${minutesBefore} minutos`,
        data,
        appointment.client.id,
        'high'
      );
    }
  }

  /**
   * Notificar conflicto de horarios
   */
  async broadcastScheduleConflict(
    tenantId: string,
    professionalId: string,
    conflictData: any
  ): Promise<void> {
    const message = 'Conflicto de horarios detectado';

    // Notificar a admins y managers
    emitToRole('ADMIN', tenantId, 'schedule:conflict', {
      professionalId,
      conflict: conflictData,
      timestamp: new Date(),
    });

    emitToRole('MANAGER', tenantId, 'schedule:conflict', {
      professionalId,
      conflict: conflictData,
      timestamp: new Date(),
    });

    // Notificar al profesional
    await this.createAndEmitNotification(
      tenantId,
      'schedule:conflict',
      message,
      conflictData,
      professionalId,
      'urgent'
    );
  }

  /**
   * Notificación genérica
   */
  async sendCustomNotification(
    tenantId: string,
    userId: string | null,
    type: string,
    message: string,
    data?: any,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<void> {
    await this.createAndEmitNotification(
      tenantId,
      type,
      message,
      data,
      userId || undefined,
      priority
    );
  }
}

export const realtimeNotificationService = new RealtimeNotificationService();
