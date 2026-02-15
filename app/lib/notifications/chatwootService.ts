/**
 * Chatwoot Notification Service
 * 
 * Servicio para enviar notificaciones a través de Chatwoot
 * Compatible con el patrón de servicios de notificación existentes
 */

import { chatwootApiService } from '@/lib/chatwoot/api';

export interface ChatwootOptions {
  to: string; // Número de teléfono del destinatario
  message: string; // Contenido del mensaje
  tenantId: string; // ID del tenant
  clientName?: string; // Nombre del cliente (opcional para auto-creación)
  clientEmail?: string; // Email del cliente (opcional)
}

export class ChatwootService {
  /**
   * Envía un mensaje a través de Chatwoot
   * 
   * @param options - Opciones de envío del mensaje
   * @returns Resultado del envío con éxito/error
   */
  async sendChatwoot(options: ChatwootOptions): Promise<{ 
    success: boolean; 
    messageId?: string; 
    error?: string 
  }> {
    try {
      // Validar que el número de teléfono esté presente
      if (!options.to) {
        return {
          success: false,
          error: 'Número de teléfono requerido',
        };
      }

      // Validar que el mensaje esté presente
      if (!options.message) {
        return {
          success: false,
          error: 'Mensaje requerido',
        };
      }

      // Cargar configuración del tenant
      const configured = await chatwootApiService.loadConfigForTenant(options.tenantId);
      if (!configured) {
        return {
          success: false,
          error: 'Chatwoot no está configurado para este tenant',
        };
      }

      // Enviar mensaje a través del servicio de API
      const result = await chatwootApiService.sendMessageToContact({
        to: options.to,
        message: options.message,
        tenantId: options.tenantId,
      });

      return result;
    } catch (error: any) {
      console.error('Chatwoot sending error:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar mensaje por Chatwoot',
      };
    }
  }

  /**
   * Prueba la conexión con Chatwoot
   * 
   * @param tenantId - ID del tenant a verificar
   * @returns true si la conexión es exitosa, false si falla
   */
  async testConnection(tenantId?: string): Promise<boolean> {
    try {
      // Si se proporciona tenantId, cargar configuración específica
      if (tenantId) {
        const configured = await chatwootApiService.loadConfigForTenant(tenantId);
        if (!configured) {
          console.warn('Chatwoot not configured for tenant:', tenantId);
          return false;
        }
      }

      // Probar conexión
      return await chatwootApiService.testConnection();
    } catch (error) {
      console.error('Chatwoot connection test failed:', error);
      return false;
    }
  }

  /**
   * Envía un mensaje de confirmación de cita
   */
  async sendAppointmentConfirmation(options: {
    to: string;
    tenantId: string;
    clientName: string;
    appointmentDate: string;
    appointmentTime: string;
    serviceName: string;
    professionalName: string;
    branchName: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `✅ *Cita Confirmada*\n\n` +
      `Hola ${options.clientName}, tu cita ha sido confirmada.\n\n` +
      `📅 Fecha: ${options.appointmentDate}\n` +
      `⏰ Hora: ${options.appointmentTime}\n` +
      `💼 Servicio: ${options.serviceName}\n` +
      `👤 Profesional: ${options.professionalName}\n` +
      `📍 Sucursal: ${options.branchName}\n\n` +
      `¡Te esperamos!`;

    return this.sendChatwoot({
      to: options.to,
      message,
      tenantId: options.tenantId,
      clientName: options.clientName,
    });
  }

  /**
   * Envía un recordatorio de cita
   */
  async sendAppointmentReminder(options: {
    to: string;
    tenantId: string;
    clientName: string;
    appointmentDate: string;
    appointmentTime: string;
    serviceName: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `⏰ *Recordatorio de Cita*\n\n` +
      `Hola ${options.clientName}, te recordamos que tienes una cita:\n\n` +
      `📅 ${options.appointmentDate}\n` +
      `⏰ ${options.appointmentTime}\n` +
      `💼 ${options.serviceName}\n\n` +
      `¡No olvides asistir!`;

    return this.sendChatwoot({
      to: options.to,
      message,
      tenantId: options.tenantId,
      clientName: options.clientName,
    });
  }

  /**
   * Envía un mensaje de cancelación de cita
   */
  async sendAppointmentCancellation(options: {
    to: string;
    tenantId: string;
    clientName: string;
    appointmentDate: string;
    appointmentTime: string;
    reason?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `❌ *Cita Cancelada*\n\n` +
      `Hola ${options.clientName},\n\n` +
      `Tu cita del ${options.appointmentDate} a las ${options.appointmentTime} ha sido cancelada.\n\n` +
      (options.reason ? `Motivo: ${options.reason}\n\n` : '') +
      `Para reagendar, contáctanos.`;

    return this.sendChatwoot({
      to: options.to,
      message,
      tenantId: options.tenantId,
      clientName: options.clientName,
    });
  }

  /**
   * Envía un mensaje de marketing
   */
  async sendMarketingMessage(options: {
    to: string;
    tenantId: string;
    clientName: string;
    campaignMessage: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `Hola ${options.clientName},\n\n${options.campaignMessage}`;

    return this.sendChatwoot({
      to: options.to,
      message,
      tenantId: options.tenantId,
      clientName: options.clientName,
    });
  }

  /**
   * Envía un mensaje de solicitud de feedback
   */
  async sendFeedbackRequest(options: {
    to: string;
    tenantId: string;
    clientName: string;
    serviceName: string;
    feedbackUrl?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `⭐ *¿Cómo fue tu experiencia?*\n\n` +
      `Hola ${options.clientName},\n\n` +
      `Esperamos que hayas disfrutado tu servicio de ${options.serviceName}.\n\n` +
      `Tu opinión es muy importante para nosotros.` +
      (options.feedbackUrl ? `\n\nDéjanos tu feedback: ${options.feedbackUrl}` : '');

    return this.sendChatwoot({
      to: options.to,
      message,
      tenantId: options.tenantId,
      clientName: options.clientName,
    });
  }
}

// Instancia singleton
export const chatwootService = new ChatwootService();
