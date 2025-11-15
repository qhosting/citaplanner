/**
 * Chatwoot API Service
 * 
 * Servicio para interactuar con la API de Chatwoot
 * - Enviar mensajes a contactos
 * - Crear/actualizar contactos
 * - Buscar contactos por teléfono
 * - Gestionar conversaciones
 */

import axios, { AxiosInstance } from 'axios';
import { prisma } from '@/lib/db';

export interface ChatwootContact {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  identifier?: string;
  custom_attributes?: Record<string, any>;
}

export interface ChatwootConversation {
  id: number;
  account_id: number;
  inbox_id: number;
  contact: ChatwootContact;
  status: 'open' | 'resolved' | 'pending';
  messages?: ChatwootMessage[];
}

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: 'incoming' | 'outgoing';
  created_at: string;
  conversation_id: number;
  sender?: {
    id: number;
    name: string;
    type: 'contact' | 'user';
  };
}

export interface SendMessageParams {
  to: string; // Phone number or contact identifier
  message: string;
  tenantId: string;
}

export interface CreateContactParams {
  name: string;
  phone_number: string;
  email?: string;
  identifier?: string;
  custom_attributes?: Record<string, any>;
}

export class ChatwootApiService {
  private apiUrl: string | null = null;
  private apiAccessToken: string | null = null;
  private accountId: string | null = null;
  private inboxId: string | null = null;
  private client: AxiosInstance | null = null;

  /**
   * Configura el servicio con las credenciales proporcionadas
   */
  setConfig(config: {
    apiUrl: string;
    apiAccessToken: string;
    accountId: string;
    inboxId: string;
  }) {
    this.apiUrl = config.apiUrl;
    this.apiAccessToken = config.apiAccessToken;
    this.accountId = config.accountId;
    this.inboxId = config.inboxId;

    this.client = axios.create({
      baseURL: `${this.apiUrl}/api/v1/accounts/${this.accountId}`,
      headers: {
        'api_access_token': this.apiAccessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Carga la configuración desde la base de datos para un tenant
   */
  async loadConfigForTenant(tenantId: string): Promise<boolean> {
    try {
      // Intentar cargar desde NotificationSettings primero
      const notifSettings = await prisma.notificationSettings.findUnique({
        where: { tenantId },
      });

      if (notifSettings?.chatwootEnabled && notifSettings.chatwootApiUrl) {
        this.setConfig({
          apiUrl: notifSettings.chatwootApiUrl,
          apiAccessToken: notifSettings.chatwootApiToken || '',
          accountId: notifSettings.chatwootAccountId || '',
          inboxId: notifSettings.chatwootInboxId || '',
        });
        return true;
      }

      // Fallback: Intentar cargar desde ChatwootConfig
      const config = await prisma.chatwootConfig.findFirst({
        where: {
          tenantId,
          isActive: true,
          enableNotifications: true,
        },
      });

      if (config && config.apiAccessToken && config.accountId && config.inboxId) {
        this.setConfig({
          apiUrl: config.baseUrl,
          apiAccessToken: config.apiAccessToken,
          accountId: config.accountId,
          inboxId: config.inboxId,
        });
        return true;
      }

      // Fallback final: Variables de entorno
      if (process.env.CHATWOOT_API_URL && process.env.CHATWOOT_API_ACCESS_TOKEN) {
        this.setConfig({
          apiUrl: process.env.CHATWOOT_API_URL,
          apiAccessToken: process.env.CHATWOOT_API_ACCESS_TOKEN,
          accountId: process.env.CHATWOOT_ACCOUNT_ID || '',
          inboxId: process.env.CHATWOOT_INBOX_ID || '',
        });
        return true;
      }

      console.warn(`[ChatwootAPI] No se encontró configuración activa para tenant ${tenantId}`);
      return false;
    } catch (error) {
      console.error('[ChatwootAPI] Error cargando configuración:', error);
      return false;
    }
  }

  /**
   * Verifica si el servicio está configurado
   */
  private ensureConfigured(): boolean {
    if (!this.client || !this.apiUrl || !this.apiAccessToken) {
      console.error('[ChatwootAPI] Servicio no configurado');
      return false;
    }
    return true;
  }

  /**
   * Busca un contacto por número de teléfono
   */
  async findContactByPhone(phoneNumber: string): Promise<ChatwootContact | null> {
    if (!this.ensureConfigured()) {
      return null;
    }

    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      const response = await this.client!.get('/contacts/search', {
        params: {
          q: normalizedPhone,
        },
      });

      const contacts = response.data.payload as ChatwootContact[];
      
      // Buscar contacto que coincida exactamente con el teléfono
      const contact = contacts.find((c) => 
        this.normalizePhoneNumber(c.phone_number || '') === normalizedPhone
      );

      return contact || null;
    } catch (error: any) {
      console.error('[ChatwootAPI] Error buscando contacto:', error.message);
      return null;
    }
  }

  /**
   * Crea un nuevo contacto en Chatwoot
   */
  async createContact(params: CreateContactParams): Promise<ChatwootContact | null> {
    if (!this.ensureConfigured()) {
      return null;
    }

    try {
      const response = await this.client!.post('/contacts', {
        name: params.name,
        phone_number: this.normalizePhoneNumber(params.phone_number),
        email: params.email,
        identifier: params.identifier,
        custom_attributes: params.custom_attributes || {},
      });

      return response.data.payload as ChatwootContact;
    } catch (error: any) {
      console.error('[ChatwootAPI] Error creando contacto:', error.message);
      return null;
    }
  }

  /**
   * Actualiza un contacto existente
   */
  async updateContact(
    contactId: number,
    updates: Partial<CreateContactParams>
  ): Promise<ChatwootContact | null> {
    if (!this.ensureConfigured()) {
      return null;
    }

    try {
      const response = await this.client!.patch(`/contacts/${contactId}`, updates);
      return response.data.payload as ChatwootContact;
    } catch (error: any) {
      console.error('[ChatwootAPI] Error actualizando contacto:', error.message);
      return null;
    }
  }

  /**
   * Busca o crea un contacto
   */
  async findOrCreateContact(params: CreateContactParams): Promise<ChatwootContact | null> {
    // Primero intentar buscar por teléfono
    let contact = await this.findContactByPhone(params.phone_number);

    if (!contact) {
      // Si no existe, crear nuevo contacto
      contact = await this.createContact(params);
    }

    return contact;
  }

  /**
   * Crea una conversación con un contacto
   */
  async createConversation(contactId: number): Promise<ChatwootConversation | null> {
    if (!this.ensureConfigured()) {
      return null;
    }

    try {
      const response = await this.client!.post('/conversations', {
        source_id: `${contactId}-${Date.now()}`,
        inbox_id: this.inboxId,
        contact_id: contactId,
        status: 'open',
      });

      return response.data as ChatwootConversation;
    } catch (error: any) {
      console.error('[ChatwootAPI] Error creando conversación:', error.message);
      return null;
    }
  }

  /**
   * Obtiene la conversación activa de un contacto
   */
  async getActiveConversation(contactId: number): Promise<ChatwootConversation | null> {
    if (!this.ensureConfigured()) {
      return null;
    }

    try {
      const response = await this.client!.get('/conversations', {
        params: {
          inbox_id: this.inboxId,
          status: 'open',
        },
      });

      const conversations = response.data.payload as ChatwootConversation[];
      
      // Buscar conversación del contacto
      const conversation = conversations.find((conv) => conv.contact.id === contactId);

      return conversation || null;
    } catch (error: any) {
      console.error('[ChatwootAPI] Error obteniendo conversación:', error.message);
      return null;
    }
  }

  /**
   * Envía un mensaje a través de una conversación
   */
  async sendMessage(conversationId: number, message: string): Promise<ChatwootMessage | null> {
    if (!this.ensureConfigured()) {
      return null;
    }

    try {
      const response = await this.client!.post(
        `/conversations/${conversationId}/messages`,
        {
          content: message,
          message_type: 'outgoing',
          private: false,
        }
      );

      return response.data as ChatwootMessage;
    } catch (error: any) {
      console.error('[ChatwootAPI] Error enviando mensaje:', error.message);
      return null;
    }
  }

  /**
   * Envía un mensaje a un contacto (flujo completo)
   */
  async sendMessageToContact(params: SendMessageParams): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // 1. Cargar configuración del tenant
      const configured = await this.loadConfigForTenant(params.tenantId);
      if (!configured) {
        return {
          success: false,
          error: 'Chatwoot no está configurado para este tenant',
        };
      }

      // 2. Buscar o crear contacto
      const contact = await this.findOrCreateContact({
        name: 'Cliente', // Nombre por defecto, se actualizará después
        phone_number: params.to,
      });

      if (!contact) {
        return {
          success: false,
          error: 'No se pudo crear o encontrar el contacto en Chatwoot',
        };
      }

      // 3. Obtener o crear conversación
      let conversation = await this.getActiveConversation(contact.id);
      
      if (!conversation) {
        conversation = await this.createConversation(contact.id);
      }

      if (!conversation) {
        return {
          success: false,
          error: 'No se pudo crear la conversación en Chatwoot',
        };
      }

      // 4. Enviar mensaje
      const message = await this.sendMessage(conversation.id, params.message);

      if (!message) {
        return {
          success: false,
          error: 'No se pudo enviar el mensaje',
        };
      }

      return {
        success: true,
        messageId: `chatwoot-${message.id}`,
      };
    } catch (error: any) {
      console.error('[ChatwootAPI] Error en flujo de envío:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar mensaje',
      };
    }
  }

  /**
   * Normaliza un número de teléfono para comparación
   */
  private normalizePhoneNumber(phone: string): string {
    // Remover todos los caracteres no numéricos excepto el +
    return phone.replace(/[^\d+]/g, '');
  }

  /**
   * Prueba la conexión con Chatwoot
   */
  async testConnection(): Promise<boolean> {
    if (!this.ensureConfigured()) {
      return false;
    }

    try {
      await this.client!.get('/inboxes');
      console.log('[ChatwootAPI] Conexión exitosa');
      return true;
    } catch (error: any) {
      console.error('[ChatwootAPI] Error en prueba de conexión:', error.message);
      return false;
    }
  }
}

// Instancia singleton
export const chatwootApiService = new ChatwootApiService();
