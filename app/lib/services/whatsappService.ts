/**
 * WhatsApp Service - Integration with Evolution API
 * 
 * This service provides functions to:
 * - Send WhatsApp messages via Evolution API
 * - Validate API connections
 * - Process message templates with variables
 * - Log message attempts and responses
 * - Encrypt/decrypt API keys for security
 * 
 * @module whatsappService
 */

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Types
export interface WhatsAppConfig {
  id: string;
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  phoneNumber: string;
  isActive: boolean;
  sendOnCreate: boolean;
  sendOnUpdate: boolean;
  sendOnCancel: boolean;
  sendReminder24h: boolean;
  sendReminder1h: boolean;
  tenantId: string;
  branchId: string | null;
}

export interface SendMessageParams {
  recipient: string; // Phone number with country code (e.g., "521234567890")
  message: string;
  configId: string;
  appointmentId?: string;
  messageType: string;
}

export interface EvolutionAPIResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface TemplateVariables {
  cliente?: string;
  servicio?: string;
  fecha?: string;
  hora?: string;
  profesional?: string;
  sucursal?: string;
  direccion?: string;
  telefono?: string;
  precio?: string;
  duracion?: string;
  [key: string]: string | undefined;
}

// Encryption configuration
const ENCRYPTION_KEY = process.env.WHATSAPP_ENCRYPTION_KEY || "citaplanner-default-encryption-key-32bytes";
const ENCRYPTION_IV_LENGTH = 16;
const ENCRYPTION_ALGORITHM = "aes-256-cbc";

/**
 * Encrypt API Key before saving to database
 */
export function encryptApiKey(apiKey: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    let encrypted = cipher.update(apiKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Return IV + encrypted data
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("[WhatsApp] Error encrypting API key:", error);
    throw new Error("Failed to encrypt API key");
  }
}

/**
 * Decrypt API Key when reading from database
 */
export function decryptApiKey(encryptedKey: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
    const parts = encryptedKey.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("[WhatsApp] Error decrypting API key:", error);
    throw new Error("Failed to decrypt API key");
  }
}

/**
 * Get WhatsApp configuration for a tenant/branch
 * Returns branch-specific config if available, otherwise returns tenant default config
 */
export async function getWhatsAppConfig(
  tenantId: string,
  branchId?: string | null
): Promise<WhatsAppConfig | null> {
  try {
    // Try to get branch-specific config first
    if (branchId) {
      const branchConfig = await prisma.whatsAppConfig.findFirst({
        where: {
          tenantId,
          branchId,
          isActive: true,
        },
      });
      
      if (branchConfig) {
        return {
          ...branchConfig,
          apiKey: decryptApiKey(branchConfig.apiKey),
        };
      }
    }
    
    // Fallback to tenant default config
    const tenantConfig = await prisma.whatsAppConfig.findFirst({
      where: {
        tenantId,
        branchId: null,
        isActive: true,
        isDefault: true,
      },
    });
    
    if (tenantConfig) {
      return {
        ...tenantConfig,
        apiKey: decryptApiKey(tenantConfig.apiKey),
      };
    }
    
    return null;
  } catch (error) {
    console.error("[WhatsApp] Error fetching config:", error);
    return null;
  }
}

/**
 * Validate Evolution API connection
 */
export async function validateConnection(config: WhatsAppConfig): Promise<EvolutionAPIResponse> {
  try {
    const response = await fetch(`${config.apiUrl}/instance/connectionState/${config.instanceName}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": config.apiKey,
      },
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`,
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      message: "Connection validated successfully",
      data,
    };
  } catch (error: any) {
    console.error("[WhatsApp] Connection validation error:", error);
    return {
      success: false,
      error: error.message || "Connection validation failed",
    };
  }
}

/**
 * Send WhatsApp message via Evolution API
 */
export async function sendWhatsAppMessage(params: SendMessageParams): Promise<EvolutionAPIResponse> {
  try {
    // Get config
    const config = await prisma.whatsAppConfig.findUnique({
      where: { id: params.configId },
    });
    
    if (!config) {
      throw new Error("WhatsApp configuration not found");
    }
    
    if (!config.isActive) {
      throw new Error("WhatsApp configuration is not active");
    }
    
    const decryptedApiKey = decryptApiKey(config.apiKey);
    
    // Format phone number (remove any non-digit characters)
    const formattedPhone = params.recipient.replace(/\D/g, "");
    
    // Send message via Evolution API
    const response = await fetch(`${config.apiUrl}/message/sendText/${config.instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": decryptedApiKey,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: params.message,
      }),
    });
    
    const responseData = await response.json();
    
    // Log the message attempt
    await prisma.whatsAppLog.create({
      data: {
        configId: params.configId,
        appointmentId: params.appointmentId,
        messageType: params.messageType,
        recipient: formattedPhone,
        message: params.message,
        status: response.ok ? "SENT" : "FAILED",
        response: JSON.stringify(responseData),
        error: response.ok ? null : responseData.error || "Unknown error",
        sentAt: response.ok ? new Date() : null,
      },
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: responseData.error || `API returned status ${response.status}`,
        data: responseData,
      };
    }
    
    return {
      success: true,
      message: "Message sent successfully",
      data: responseData,
    };
  } catch (error: any) {
    console.error("[WhatsApp] Send message error:", error);
    
    // Log the error
    try {
      await prisma.whatsAppLog.create({
        data: {
          configId: params.configId,
          appointmentId: params.appointmentId,
          messageType: params.messageType,
          recipient: params.recipient,
          message: params.message,
          status: "FAILED",
          error: error.message || "Unknown error",
        },
      });
    } catch (logError) {
      console.error("[WhatsApp] Error logging failed message:", logError);
    }
    
    return {
      success: false,
      error: error.message || "Failed to send message",
    };
  }
}

/**
 * Process template with variables
 */
export function processTemplate(template: string, variables: TemplateVariables): string {
  let processed = template;
  
  // Replace all variables in format {variable}
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      processed = processed.replace(regex, value);
    }
  });
  
  return processed;
}

/**
 * Get default message template by type
 */
export async function getMessageTemplate(
  tenantId: string,
  type: string,
  branchId?: string | null
): Promise<string | null> {
  try {
    // Try to get branch-specific template first
    if (branchId) {
      const branchTemplate = await prisma.messageTemplate.findFirst({
        where: {
          tenantId,
          branchId,
          type: type as any,
          isActive: true,
        },
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "desc" },
        ],
      });
      
      if (branchTemplate) {
        return branchTemplate.content;
      }
    }
    
    // Fallback to tenant default template
    const tenantTemplate = await prisma.messageTemplate.findFirst({
      where: {
        tenantId,
        branchId: null,
        type: type as any,
        isActive: true,
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });
    
    return tenantTemplate?.content || null;
  } catch (error) {
    console.error("[WhatsApp] Error fetching template:", error);
    return null;
  }
}

/**
 * Send appointment notification
 */
export async function sendAppointmentNotification(
  appointmentId: string,
  messageType: "APPOINTMENT_CREATED" | "APPOINTMENT_UPDATED" | "APPOINTMENT_CANCELLED"
): Promise<EvolutionAPIResponse> {
  try {
    // Get appointment with all relations
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        service: true,
        user: true,
        branch: true,
      },
    });
    
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    
    // Get WhatsApp config
    const config = await getWhatsAppConfig(appointment.tenantId, appointment.branchId);
    
    if (!config) {
      console.warn("[WhatsApp] No configuration found for tenant/branch");
      return {
        success: false,
        error: "WhatsApp not configured for this tenant/branch",
      };
    }
    
    // Check if notification type is enabled
    if (
      (messageType === "APPOINTMENT_CREATED" && !config.sendOnCreate) ||
      (messageType === "APPOINTMENT_UPDATED" && !config.sendOnUpdate) ||
      (messageType === "APPOINTMENT_CANCELLED" && !config.sendOnCancel)
    ) {
      console.log(`[WhatsApp] Notification type ${messageType} is disabled`);
      return {
        success: false,
        error: `Notification type ${messageType} is disabled`,
      };
    }
    
    // Get message template
    const template = await getMessageTemplate(appointment.tenantId, messageType, appointment.branchId);
    
    if (!template) {
      console.warn("[WhatsApp] No template found for type:", messageType);
      return {
        success: false,
        error: `No template found for type: ${messageType}`,
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
    return await sendWhatsAppMessage({
      recipient: appointment.client.phone,
      message,
      configId: config.id,
      appointmentId: appointment.id,
      messageType: messageType.toLowerCase(),
    });
  } catch (error: any) {
    console.error("[WhatsApp] Error sending appointment notification:", error);
    return {
      success: false,
      error: error.message || "Failed to send appointment notification",
    };
  }
}

/**
 * Get WhatsApp logs with filters
 */
export async function getWhatsAppLogs(params: {
  tenantId?: string;
  configId?: string;
  appointmentId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = {};
    
    if (params.configId) {
      where.configId = params.configId;
    }
    
    if (params.appointmentId) {
      where.appointmentId = params.appointmentId;
    }
    
    if (params.status) {
      where.status = params.status;
    }
    
    // If tenantId is provided, we need to filter through config relation
    if (params.tenantId) {
      where.config = {
        tenantId: params.tenantId,
      };
    }
    
    const [logs, total] = await Promise.all([
      prisma.whatsAppLog.findMany({
        where,
        include: {
          config: {
            select: {
              instanceName: true,
              phoneNumber: true,
              tenant: {
                select: {
                  name: true,
                },
              },
              branch: {
                select: {
                  name: true,
                },
              },
            },
          },
          appointment: {
            select: {
              id: true,
              startTime: true,
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: params.limit || 50,
        skip: params.offset || 0,
      }),
      prisma.whatsAppLog.count({ where }),
    ]);
    
    return {
      logs,
      total,
      limit: params.limit || 50,
      offset: params.offset || 0,
    };
  } catch (error) {
    console.error("[WhatsApp] Error fetching logs:", error);
    throw error;
  }
}
