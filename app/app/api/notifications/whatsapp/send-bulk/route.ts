
/**
 * API: Envío de WhatsApp Masivo
 * 
 * POST /api/notifications/whatsapp/send-bulk - Enviar mensajes masivos
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { z } from 'zod';
import { notificationService } from '@/lib/services/notificationService';

// Schema de validación
const sendBulkWhatsAppSchema = z.object({
  recipientIds: z.array(z.string()).min(1, 'Debe proporcionar al menos un destinatario'),
  templateId: z.string().min(1, 'El ID de la plantilla es requerido'),
  variables: z.record(z.any()).optional(),
  type: z.nativeEnum(NotificationType).optional(),
});

/**
 * POST - Enviar mensajes de WhatsApp masivos
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validar datos
    const validatedData = sendBulkWhatsAppSchema.parse(body);

    // Limitar cantidad de destinatarios por seguridad
    if (validatedData.recipientIds.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Máximo 100 destinatarios por envío' },
        { status: 400 }
      );
    }

    // Enviar notificaciones masivas
    const result = await notificationService.sendBulkNotifications(
      validatedData.recipientIds,
      {
        type: validatedData.type || NotificationType.PROMOTION,
        channel: NotificationChannel.WHATSAPP,
        templateId: validatedData.templateId,
        variables: validatedData.variables,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        total: result.total,
        sent: result.sent,
        failed: result.failed,
        message: `Enviados: ${result.sent}/${result.total}`,
      },
    });

  } catch (error: any) {
    console.error('[API] Error al enviar WhatsApp masivo:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Error al enviar mensajes' },
      { status: 500 }
    );
  }
}
