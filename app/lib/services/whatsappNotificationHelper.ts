/**
 * WhatsApp Notification Helper
 * 
 * Non-blocking notification sender for appointments
 * This helper sends WhatsApp notifications asynchronously without blocking API responses
 */

import { sendAppointmentNotification } from "./whatsappService";

/**
 * Send notification asynchronously (fire and forget)
 * This won't block the API response or throw errors
 */
export async function sendWhatsAppNotificationAsync(
  appointmentId: string,
  notificationType: "APPOINTMENT_CREATED" | "APPOINTMENT_UPDATED" | "APPOINTMENT_CANCELLED"
): Promise<void> {
  // Execute in next tick to avoid blocking
  setImmediate(async () => {
    try {
      console.log(`[WhatsApp] Sending ${notificationType} notification for appointment ${appointmentId}`);
      
      const result = await sendAppointmentNotification(appointmentId, notificationType);
      
      if (result.success) {
        console.log(`[WhatsApp] Notification sent successfully for appointment ${appointmentId}`);
      } else {
        console.warn(`[WhatsApp] Failed to send notification: ${result.error}`);
      }
    } catch (error: any) {
      // Don't throw, just log
      console.error(`[WhatsApp] Error sending notification:`, error);
    }
  });
}

/**
 * Quick helper for appointment creation
 */
export function notifyAppointmentCreated(appointmentId: string): void {
  sendWhatsAppNotificationAsync(appointmentId, "APPOINTMENT_CREATED");
}

/**
 * Quick helper for appointment update
 */
export function notifyAppointmentUpdated(appointmentId: string): void {
  sendWhatsAppNotificationAsync(appointmentId, "APPOINTMENT_UPDATED");
}

/**
 * Quick helper for appointment cancellation
 */
export function notifyAppointmentCancelled(appointmentId: string): void {
  sendWhatsAppNotificationAsync(appointmentId, "APPOINTMENT_CANCELLED");
}
