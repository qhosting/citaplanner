
/**
 * Notification Middleware
 * 
 * Funciones helper para disparar notificaciones automáticas
 * desde los endpoints de la API sin bloquear la respuesta principal
 */

import { notificationAutomationService } from '../services/notificationAutomationService';

/**
 * Dispara notificación de confirmación de cita de forma asíncrona
 * No bloquea la respuesta del endpoint
 */
export function triggerAppointmentConfirmation(appointmentId: string): void {
  // Ejecutar de forma asíncrona sin esperar
  setImmediate(async () => {
    try {
      await notificationAutomationService.sendAppointmentConfirmation(appointmentId);
    } catch (error: any) {
      console.error('[NotificationMiddleware] Error al disparar confirmación:', error);
    }
  });
}

/**
 * Dispara notificación de reprogramación de cita
 */
export function triggerAppointmentReschedule(
  appointmentId: string,
  oldStartTime: Date,
  newStartTime: Date
): void {
  setImmediate(async () => {
    try {
      await notificationAutomationService.sendAppointmentRescheduleNotification(
        appointmentId,
        oldStartTime,
        newStartTime
      );
    } catch (error: any) {
      console.error('[NotificationMiddleware] Error al disparar reprogramación:', error);
    }
  });
}

/**
 * Dispara notificación de cancelación de cita
 */
export function triggerAppointmentCancellation(appointmentId: string): void {
  setImmediate(async () => {
    try {
      await notificationAutomationService.sendAppointmentCancellationNotification(appointmentId);
    } catch (error: any) {
      console.error('[NotificationMiddleware] Error al disparar cancelación:', error);
    }
  });
}

/**
 * Dispara recordatorio de pago
 */
export function triggerPaymentReminder(saleId: string): void {
  setImmediate(async () => {
    try {
      await notificationAutomationService.sendPaymentReminder(saleId);
    } catch (error: any) {
      console.error('[NotificationMiddleware] Error al disparar recordatorio de pago:', error);
    }
  });
}

/**
 * Wrapper genérico para ejecutar funciones asíncronas sin bloquear
 */
export function executeAsync(fn: () => Promise<void>): void {
  setImmediate(async () => {
    try {
      await fn();
    } catch (error: any) {
      console.error('[NotificationMiddleware] Error en ejecución asíncrona:', error);
    }
  });
}
