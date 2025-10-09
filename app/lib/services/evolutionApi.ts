
/**
 * Evolution API Service
 * 
 * Cliente para interactuar con Evolution API (WhatsApp Business API)
 * Soporta tanto Baileys-based API como WhatsApp Cloud API oficial
 * 
 * Documentación: https://doc.evolution-api.com/v2/en/integrations/cloudapi
 */

interface EvolutionApiConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

interface SendTextMessageParams {
  to: string;
  message: string;
  delay?: number;
  linkPreview?: boolean;
}

interface SendMediaMessageParams {
  to: string;
  mediaUrl: string;
  caption?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  fileName?: string;
}

interface InstanceStatus {
  instance: string;
  state: 'open' | 'connecting' | 'close';
  status?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  messageId?: string;
}

export class EvolutionApiService {
  private config: EvolutionApiConfig | null = null;

  constructor(config?: EvolutionApiConfig) {
    if (config) {
      this.config = config;
    } else {
      this.initializeFromEnv();
    }
  }

  /**
   * Inicializa la configuración desde variables de entorno
   */
  private initializeFromEnv(): void {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

    if (apiUrl && apiKey && instanceName) {
      this.config = { apiUrl, apiKey, instanceName };
    }
  }

  /**
   * Actualiza la configuración del servicio
   */
  public setConfig(config: EvolutionApiConfig): void {
    this.config = config;
  }

  /**
   * Verifica si el servicio está configurado
   */
  public isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Valida formato de número de teléfono
   * Acepta formatos: +521234567890, 521234567890, 1234567890
   */
  public validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
    // Remover espacios y caracteres especiales excepto +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Validar que tenga al menos 10 dígitos
    const digitsOnly = cleaned.replace(/\+/g, '');
    if (digitsOnly.length < 10) {
      return {
        valid: false,
        error: 'El número debe tener al menos 10 dígitos'
      };
    }

    // Formatear con código de país si no lo tiene
    let formatted = cleaned;
    if (!formatted.startsWith('+')) {
      // Si no tiene +, agregar + al inicio
      formatted = '+' + formatted;
    }

    // Remover el + para el formato final (Evolution API lo requiere sin +)
    const finalFormat = formatted.replace(/\+/g, '');

    return {
      valid: true,
      formatted: finalFormat
    };
  }

  /**
   * Envía un mensaje de texto
   */
  async sendTextMessage(params: SendTextMessageParams, instanceName?: string): Promise<ApiResponse> {
    if (!this.config) {
      return {
        success: false,
        error: 'Evolution API no está configurado'
      };
    }

    const instance = instanceName || this.config.instanceName;

    // Validar número de teléfono
    const phoneValidation = this.validatePhoneNumber(params.to);
    if (!phoneValidation.valid) {
      return {
        success: false,
        error: phoneValidation.error
      };
    }

    try {
      const url = `${this.config.apiUrl}/message/sendText/${instance}`;
      
      console.log(`[EvolutionAPI] Enviando mensaje de texto a ${phoneValidation.formatted}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.apiKey,
        },
        body: JSON.stringify({
          number: phoneValidation.formatted,
          text: params.message,
          delay: params.delay || 0,
          linkPreview: params.linkPreview !== false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`[EvolutionAPI] Mensaje enviado exitosamente. ID: ${data.key?.id || data.messageId}`);

      return {
        success: true,
        data,
        messageId: data.key?.id || data.messageId,
      };
    } catch (error: any) {
      console.error('[EvolutionAPI] Error al enviar mensaje de texto:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar mensaje',
      };
    }
  }

  /**
   * Envía un mensaje con multimedia (imagen, video, audio, documento)
   */
  async sendMediaMessage(params: SendMediaMessageParams, instanceName?: string): Promise<ApiResponse> {
    if (!this.config) {
      return {
        success: false,
        error: 'Evolution API no está configurado'
      };
    }

    const instance = instanceName || this.config.instanceName;

    // Validar número de teléfono
    const phoneValidation = this.validatePhoneNumber(params.to);
    if (!phoneValidation.valid) {
      return {
        success: false,
        error: phoneValidation.error
      };
    }

    try {
      const mediaType = params.mediaType || 'image';
      const url = `${this.config.apiUrl}/message/sendMedia/${instance}`;
      
      console.log(`[EvolutionAPI] Enviando mensaje multimedia (${mediaType}) a ${phoneValidation.formatted}`);

      const payload: any = {
        number: phoneValidation.formatted,
        mediatype: mediaType,
        media: params.mediaUrl,
      };

      if (params.caption) {
        payload.caption = params.caption;
      }

      if (params.fileName) {
        payload.fileName = params.fileName;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`[EvolutionAPI] Mensaje multimedia enviado exitosamente. ID: ${data.key?.id || data.messageId}`);

      return {
        success: true,
        data,
        messageId: data.key?.id || data.messageId,
      };
    } catch (error: any) {
      console.error('[EvolutionAPI] Error al enviar mensaje multimedia:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar mensaje multimedia',
      };
    }
  }

  /**
   * Obtiene el estado de la instancia
   */
  async getInstanceStatus(instanceName?: string): Promise<ApiResponse<InstanceStatus>> {
    if (!this.config) {
      return {
        success: false,
        error: 'Evolution API no está configurado'
      };
    }

    const instance = instanceName || this.config.instanceName;

    try {
      const url = `${this.config.apiUrl}/instance/connectionState/${instance}`;
      
      console.log(`[EvolutionAPI] Consultando estado de instancia: ${instance}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': this.config.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`[EvolutionAPI] Estado de instancia: ${data.state || 'desconocido'}`);

      return {
        success: true,
        data: {
          instance,
          state: data.state || 'close',
          status: data.status,
        },
      };
    } catch (error: any) {
      console.error('[EvolutionAPI] Error al consultar estado de instancia:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al consultar estado',
      };
    }
  }

  /**
   * Verifica la conexión con Evolution API
   */
  async testConnection(): Promise<boolean> {
    const result = await this.getInstanceStatus();
    return result.success && result.data?.state === 'open';
  }
}

// Instancia singleton para uso global
export const evolutionApiService = new EvolutionApiService();
