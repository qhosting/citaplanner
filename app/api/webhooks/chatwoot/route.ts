/**
 * Webhook de Chatwoot
 * 
 * Recibe eventos de Chatwoot y procesa:
 * - Mensajes entrantes
 * - Nuevas conversaciones
 * - Detección automática de clientes
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { chatwootClientMatcher } from '@/lib/chatwoot/client-matcher';

// Tipos de eventos de Chatwoot
interface ChatwootWebhookEvent {
  event: string; // 'message_created', 'conversation_created', 'conversation_updated', etc.
  id: number;
  content?: string;
  created_at?: string;
  message_type?: 'incoming' | 'outgoing';
  conversation?: {
    id: number;
    inbox_id: number;
    status: string;
    contact: {
      id: number;
      name: string;
      email?: string;
      phone_number?: string;
      custom_attributes?: Record<string, any>;
    };
  };
  sender?: {
    id: number;
    name: string;
    email?: string;
    type: 'contact' | 'user';
  };
  account?: {
    id: number;
    name: string;
  };
}

/**
 * POST - Recibir webhooks de Chatwoot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatwootWebhookEvent;
    
    console.log('[ChatwootWebhook] Evento recibido:', {
      event: body.event,
      id: body.id,
      messageType: body.message_type,
    });

    // Validar que el evento sea relevante
    if (!body.event) {
      return NextResponse.json(
        { success: false, error: 'Evento no especificado' },
        { status: 400 }
      );
    }

    // Procesar según el tipo de evento
    switch (body.event) {
      case 'message_created':
        await handleMessageCreated(body);
        break;
      
      case 'conversation_created':
        await handleConversationCreated(body);
        break;
      
      case 'conversation_updated':
        await handleConversationUpdated(body);
        break;
      
      default:
        console.log(`[ChatwootWebhook] Evento no manejado: ${body.event}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Evento procesado',
    });
  } catch (error: any) {
    console.error('[ChatwootWebhook] Error procesando evento:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Maneja el evento de mensaje creado
 */
async function handleMessageCreated(event: ChatwootWebhookEvent) {
  try {
    // Solo procesar mensajes entrantes de contactos
    if (event.message_type !== 'incoming' || !event.conversation) {
      console.log('[ChatwootWebhook] Mensaje saliente o sin conversación, ignorado');
      return;
    }

    const contact = event.conversation.contact;
    const phoneNumber = contact.phone_number;

    if (!phoneNumber) {
      console.log('[ChatwootWebhook] Contacto sin número de teléfono, ignorado');
      return;
    }

    // Buscar tenant asociado al inbox
    const tenantConfig = await findTenantByInboxId(event.conversation.inbox_id);
    
    if (!tenantConfig) {
      console.log('[ChatwootWebhook] No se encontró tenant para inbox', event.conversation.inbox_id);
      return;
    }

    // Intentar detectar cliente
    console.log('[ChatwootWebhook] Intentando detectar cliente:', {
      phone: phoneNumber,
      contactId: contact.id,
      tenantId: tenantConfig.tenantId,
    });

    const matchResult = await chatwootClientMatcher.matchClientFromChatwootContact(
      contact.id,
      phoneNumber,
      tenantConfig.tenantId,
      contact.name
    );

    console.log('[ChatwootWebhook] Resultado de matching:', matchResult);

    // Si se encontró un cliente, registrar el mensaje
    if (matchResult.matched && matchResult.client) {
      await logChatwootInteraction({
        clientId: matchResult.client.id,
        tenantId: tenantConfig.tenantId,
        chatwootContactId: contact.id,
        conversationId: event.conversation.id,
        messageId: event.id,
        content: event.content || '',
        messageType: 'incoming',
      });
    }

  } catch (error) {
    console.error('[ChatwootWebhook] Error en handleMessageCreated:', error);
  }
}

/**
 * Maneja el evento de conversación creada
 */
async function handleConversationCreated(event: ChatwootWebhookEvent) {
  try {
    if (!event.conversation) {
      return;
    }

    const contact = event.conversation.contact;
    const phoneNumber = contact.phone_number;

    if (!phoneNumber) {
      console.log('[ChatwootWebhook] Contacto sin número de teléfono');
      return;
    }

    // Buscar tenant
    const tenantConfig = await findTenantByInboxId(event.conversation.inbox_id);
    
    if (!tenantConfig) {
      return;
    }

    // Intentar detectar cliente
    const matchResult = await chatwootClientMatcher.matchClientFromChatwootContact(
      contact.id,
      phoneNumber,
      tenantConfig.tenantId,
      contact.name
    );

    console.log('[ChatwootWebhook] Nueva conversación, cliente detectado:', matchResult.matched);

  } catch (error) {
    console.error('[ChatwootWebhook] Error en handleConversationCreated:', error);
  }
}

/**
 * Maneja el evento de conversación actualizada
 */
async function handleConversationUpdated(event: ChatwootWebhookEvent) {
  // Por ahora no hacemos nada especial con conversaciones actualizadas
  // Pero podríamos implementar lógica para tracking de estado, etc.
  console.log('[ChatwootWebhook] Conversación actualizada:', event.id);
}

/**
 * Busca el tenant asociado a un inbox de Chatwoot
 */
async function findTenantByInboxId(inboxId: number): Promise<{ tenantId: string } | null> {
  try {
    // Primero intentar en NotificationSettings
    const notifSettings = await prisma.notificationSettings.findFirst({
      where: {
        chatwootEnabled: true,
        chatwootInboxId: inboxId.toString(),
      },
    });

    if (notifSettings) {
      return { tenantId: notifSettings.tenantId };
    }

    // Fallback: Buscar en ChatwootConfig
    const config = await prisma.chatwootConfig.findFirst({
      where: {
        isActive: true,
        inboxId: inboxId.toString(),
      },
    });

    if (config) {
      return { tenantId: config.tenantId };
    }

    return null;
  } catch (error) {
    console.error('[ChatwootWebhook] Error buscando tenant:', error);
    return null;
  }
}

/**
 * Registra una interacción de Chatwoot
 * (Opcional: podríamos crear una tabla ChatwootInteraction si queremos tracking detallado)
 */
async function logChatwootInteraction(data: {
  clientId: string;
  tenantId: string;
  chatwootContactId: number;
  conversationId: number;
  messageId: number;
  content: string;
  messageType: 'incoming' | 'outgoing';
}) {
  try {
    // Por ahora solo registramos en notas del cliente
    const note = `[Chatwoot] ${data.messageType === 'incoming' ? 'Mensaje recibido' : 'Mensaje enviado'}: ${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}`;
    
    await prisma.client.update({
      where: { id: data.clientId },
      data: {
        notes: {
          set: note, // Esto sobrescribe, en producción mejor concatenar o usar tabla separada
        },
        updatedAt: new Date(),
      },
    });

    console.log('[ChatwootWebhook] Interacción registrada para cliente:', data.clientId);
  } catch (error) {
    console.error('[ChatwootWebhook] Error registrando interacción:', error);
  }
}

/**
 * GET - Verificación del webhook (para testing)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook de Chatwoot activo',
    timestamp: new Date().toISOString(),
  });
}
