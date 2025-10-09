
/**
 * API: Webhook de Evolution API
 * 
 * POST /api/notifications/whatsapp/webhook - Recibir eventos de Evolution API
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, NotificationStatus } from '@prisma/client';
import { notificationService } from '@/lib/services/notificationService';

const prisma = new PrismaClient();

/**
 * POST - Recibir eventos de Evolution API
 * 
 * Eventos soportados:
 * - messages.upsert: Mensaje enviado
 * - messages.update: Estado del mensaje actualizado (delivered, read)
 */
export async function POST(request: NextRequest) {
  try {
    // Validar webhook secret
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
    const authHeader = request.headers.get('authorization');

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.warn('[Webhook] Intento de acceso no autorizado');
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    console.log('[Webhook] Evento recibido:', JSON.stringify(body, null, 2));

    // Procesar según el tipo de evento
    const event = body.event;
    const data = body.data;

    switch (event) {
      case 'messages.upsert':
        await handleMessageUpsert(data);
        break;
      
      case 'messages.update':
        await handleMessageUpdate(data);
        break;
      
      default:
        console.log(`[Webhook] Evento no manejado: ${event}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Evento procesado',
    });

  } catch (error: any) {
    console.error('[Webhook] Error al procesar evento:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar evento' },
      { status: 500 }
    );
  }
}

/**
 * Maneja evento de mensaje enviado
 */
async function handleMessageUpsert(data: any) {
  try {
    const messageId = data.key?.id;
    
    if (!messageId) {
      console.warn('[Webhook] Mensaje sin ID');
      return;
    }

    // Buscar log por messageId en metadata (buscar en el JSON string)
    const logs = await prisma.notificationLog.findMany({
      where: {
        status: NotificationStatus.PENDING,
      }
    });

    // Filtrar por messageId en metadata
    const log = logs.find(l => {
      if (!l.metadata) return false;
      try {
        const meta = JSON.parse(l.metadata);
        return meta.messageId === messageId;
      } catch {
        return false;
      }
    });

    if (log) {
      const currentMeta = log.metadata ? JSON.parse(log.metadata) : {};
      await notificationService.updateNotificationStatus(
        log.id,
        NotificationStatus.SENT,
        {
          ...currentMeta,
          sentAt: new Date().toISOString(),
        }
      );
      
      console.log(`[Webhook] Mensaje ${messageId} marcado como enviado`);
    }

  } catch (error) {
    console.error('[Webhook] Error en handleMessageUpsert:', error);
  }
}

/**
 * Maneja evento de actualización de estado de mensaje
 */
async function handleMessageUpdate(data: any) {
  try {
    const messageId = data.key?.id;
    const status = data.update?.status;

    if (!messageId || !status) {
      console.warn('[Webhook] Actualización sin ID o estado');
      return;
    }

    // Buscar log por messageId en metadata
    const logs = await prisma.notificationLog.findMany();

    // Filtrar por messageId en metadata
    const log = logs.find(l => {
      if (!l.metadata) return false;
      try {
        const meta = JSON.parse(l.metadata);
        return meta.messageId === messageId;
      } catch {
        return false;
      }
    });

    if (!log) {
      console.warn(`[Webhook] Log no encontrado para mensaje ${messageId}`);
      return;
    }

    // Mapear estado de WhatsApp a nuestro enum
    let newStatus: NotificationStatus | null = null;

    switch (status) {
      case 'DELIVERY_ACK':
      case 'delivered':
        newStatus = NotificationStatus.DELIVERED;
        break;
      
      case 'READ':
      case 'read':
        newStatus = NotificationStatus.READ;
        break;
      
      case 'ERROR':
      case 'failed':
        newStatus = NotificationStatus.FAILED;
        break;
    }

    if (newStatus && newStatus !== log.status) {
      const currentMeta = log.metadata ? JSON.parse(log.metadata) : {};
      await notificationService.updateNotificationStatus(
        log.id,
        newStatus,
        {
          ...currentMeta,
          lastStatusUpdate: new Date().toISOString(),
          whatsappStatus: status,
        }
      );
      
      console.log(`[Webhook] Mensaje ${messageId} actualizado a ${newStatus}`);
    }

  } catch (error) {
    console.error('[Webhook] Error en handleMessageUpdate:', error);
  }
}
