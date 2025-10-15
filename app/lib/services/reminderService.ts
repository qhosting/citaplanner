
/**
 * Reminder Service - Automated WhatsApp reminders for appointments
 * 
 * This service handles:
 * - Finding appointments that need reminders
 * - Sending 24h and 1h reminders
 * - Logging reminder attempts
 * - Preventing duplicate reminders
 * 
 * @module reminderService
 */

import { prisma } from "@/lib/prisma";
import {
  getWhatsAppConfig,
  sendWhatsAppMessage,
  getMessageTemplate,
  processTemplate,
  TemplateVariables,
} from "./whatsappService";

export interface ReminderResult {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: Array<{
    appointmentId: string;
    error: string;
  }>;
}

/**
 * Get appointments that need 24h reminder
 */
export async function getAppointmentsFor24hReminder(): Promise<any[]> {
  try {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    
    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: twentyFourHoursFromNow,
          lt: twentyFiveHoursFromNow,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        // Check if reminder was already sent
        reminderLogs: {
          none: {
            reminderType: "HOURS_24",
          },
        },
      },
      include: {
        client: true,
        service: true,
        user: true,
        branch: true,
        tenant: true,
      },
    });
    
    return appointments;
  } catch (error) {
    console.error("[Reminder] Error fetching appointments for 24h reminder:", error);
    return [];
  }
}

/**
 * Get appointments that need 1h reminder
 */
export async function getAppointmentsFor1hReminder(): Promise<any[]> {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: oneHourFromNow,
          lt: twoHoursFromNow,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        // Check if reminder was already sent
        reminderLogs: {
          none: {
            reminderType: "HOURS_1",
          },
        },
      },
      include: {
        client: true,
        service: true,
        user: true,
        branch: true,
        tenant: true,
      },
    });
    
    return appointments;
  } catch (error) {
    console.error("[Reminder] Error fetching appointments for 1h reminder:", error);
    return [];
  }
}

/**
 * Send reminder for an appointment
 */
export async function sendReminder(
  appointment: any,
  reminderType: "HOURS_24" | "HOURS_1"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get WhatsApp config
    const config = await getWhatsAppConfig(appointment.tenantId, appointment.branchId);
    
    if (!config) {
      console.warn(`[Reminder] No WhatsApp config for tenant ${appointment.tenantId}`);
      return {
        success: false,
        error: "WhatsApp not configured",
      };
    }
    
    // Check if reminder type is enabled
    if (
      (reminderType === "HOURS_24" && !config.sendReminder24h) ||
      (reminderType === "HOURS_1" && !config.sendReminder1h)
    ) {
      console.log(`[Reminder] Reminder type ${reminderType} is disabled`);
      return {
        success: false,
        error: "Reminder type disabled",
      };
    }
    
    // Get template
    const templateType = reminderType === "HOURS_24" ? "REMINDER_24H" : "REMINDER_1H";
    const template = await getMessageTemplate(
      appointment.tenantId,
      templateType,
      appointment.branchId
    );
    
    if (!template) {
      console.warn(`[Reminder] No template found for ${templateType}`);
      return {
        success: false,
        error: "Template not found",
      };
    }
    
    // Prepare variables
    const variables: TemplateVariables = {
      cliente: `${appointment.client.firstName} ${appointment.client.lastName}`,
      servicio: appointment.service.name,
      fecha: new Date(appointment.startTime).toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      hora: new Date(appointment.startTime).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      profesional: `${appointment.user.firstName} ${appointment.user.lastName}`,
      sucursal: appointment.branch.name,
      direccion: appointment.branch.address || "No especificada",
      telefono: appointment.branch.phone || "No especificado",
      precio: `$${appointment.service.price.toFixed(2)}`,
      duracion: `${appointment.service.duration} minutos`,
    };
    
    // Process template
    const message = processTemplate(template, variables);
    
    // Send message
    const sendResult = await sendWhatsAppMessage({
      recipient: appointment.client.phone,
      message,
      configId: config.id,
      appointmentId: appointment.id,
      messageType: `reminder_${reminderType.toLowerCase()}`,
    });
    
    // Log reminder
    await prisma.reminderLog.create({
      data: {
        configId: config.id,
        appointmentId: appointment.id,
        reminderType: reminderType === "HOURS_24" ? "HOURS_24" : "HOURS_1",
        sentAt: new Date(),
        status: sendResult.success ? "SENT" : "FAILED",
        response: sendResult.data ? JSON.stringify(sendResult.data) : null,
        error: sendResult.error || null,
      },
    });
    
    return {
      success: sendResult.success,
      error: sendResult.error,
    };
  } catch (error: any) {
    console.error("[Reminder] Error sending reminder:", error);
    
    // Try to log the error
    try {
      const config = await getWhatsAppConfig(appointment.tenantId, appointment.branchId);
      if (config) {
        await prisma.reminderLog.create({
          data: {
            configId: config.id,
            appointmentId: appointment.id,
            reminderType: reminderType === "HOURS_24" ? "HOURS_24" : "HOURS_1",
            sentAt: new Date(),
            status: "FAILED",
            error: error.message || "Unknown error",
          },
        });
      }
    } catch (logError) {
      console.error("[Reminder] Error logging failed reminder:", logError);
    }
    
    return {
      success: false,
      error: error.message || "Failed to send reminder",
    };
  }
}

/**
 * Send all 24h reminders
 */
export async function send24hReminders(): Promise<ReminderResult> {
  console.log("[Reminder] Starting 24h reminders batch...");
  
  const appointments = await getAppointmentsFor24hReminder();
  const result: ReminderResult = {
    total: appointments.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };
  
  for (const appointment of appointments) {
    try {
      const sendResult = await sendReminder(appointment, "HOURS_24");
      
      if (sendResult.success) {
        result.sent++;
      } else {
        if (sendResult.error?.includes("disabled") || sendResult.error?.includes("not configured")) {
          result.skipped++;
        } else {
          result.failed++;
          result.errors.push({
            appointmentId: appointment.id,
            error: sendResult.error || "Unknown error",
          });
        }
      }
      
      // Add small delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        appointmentId: appointment.id,
        error: error.message || "Unknown error",
      });
    }
  }
  
  console.log("[Reminder] 24h reminders batch completed:", result);
  return result;
}

/**
 * Send all 1h reminders
 */
export async function send1hReminders(): Promise<ReminderResult> {
  console.log("[Reminder] Starting 1h reminders batch...");
  
  const appointments = await getAppointmentsFor1hReminder();
  const result: ReminderResult = {
    total: appointments.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };
  
  for (const appointment of appointments) {
    try {
      const sendResult = await sendReminder(appointment, "HOURS_1");
      
      if (sendResult.success) {
        result.sent++;
      } else {
        if (sendResult.error?.includes("disabled") || sendResult.error?.includes("not configured")) {
          result.skipped++;
        } else {
          result.failed++;
          result.errors.push({
            appointmentId: appointment.id,
            error: sendResult.error || "Unknown error",
          });
        }
      }
      
      // Add small delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        appointmentId: appointment.id,
        error: error.message || "Unknown error",
      });
    }
  }
  
  console.log("[Reminder] 1h reminders batch completed:", result);
  return result;
}

/**
 * Send all reminders (both 24h and 1h)
 */
export async function sendAllReminders(): Promise<{
  reminders24h: ReminderResult;
  reminders1h: ReminderResult;
}> {
  console.log("[Reminder] Starting all reminders batch...");
  
  const reminders24h = await send24hReminders();
  const reminders1h = await send1hReminders();
  
  console.log("[Reminder] All reminders batch completed");
  
  return {
    reminders24h,
    reminders1h,
  };
}

/**
 * Get reminder statistics
 */
export async function getReminderStats(tenantId: string, days: number = 30) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const stats = await prisma.reminderLog.groupBy({
      by: ["status", "reminderType"],
      where: {
        config: {
          tenantId,
        },
        sentAt: {
          gte: since,
        },
      },
      _count: true,
    });
    
    return stats;
  } catch (error) {
    console.error("[Reminder] Error fetching stats:", error);
    return [];
  }
}
