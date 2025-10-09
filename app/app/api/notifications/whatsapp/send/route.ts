
/**
 * API: Envío de WhatsApp Individual
 * 
 * POST /api/notifications/whatsapp/send - Enviar mensaje individual
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { z } from 'zod';
import { notificationService } from '@/lib/services/notificationService';

// Schema de validación
const sendWhatsAppSchema = z.object({
  recipientId: z.string().min(1, 'El ID del destinatario es requerido'),
  templateId: z.string().optional(),
  message: z.string().optional(),
  variables: z.record(z.any()).optional(),
  type: z.nativeEnum(NotificationType).optional(),
});

/**
 * POST - Enviar mensaje de WhatsApp individual
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
    const validatedData = sendWhatsAppSchema.parse(body);

    // Validar que se proporcione templateId o message
    if (!validatedData.templateId && !validatedData.message) {
      return NextResponse.json(
        { success: false, error: 'Debe proporcionar templateId o message' },
        { status: 400 }
      );
    }

    // Enviar notificación
    const result = await notificationService.sendNotification({
      type: validatedData.type || NotificationType.WHATSAPP,
      channel: NotificationChannel.WHATSAPP,
      recipientId: validatedData.recipientId,
      templateId: validatedData.templateId,
      message: validatedData.message,
      variables: validatedData.variables,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        logId: result.logId,
        messageId: result.messageId,
        message: 'Mensaje enviado exitosamente',
      },
    });

  } catch (error: any) {
    console.error('[API] Error al enviar WhatsApp:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}
