
/**
 * API: Configuración de Notificaciones
 * 
 * GET  /api/notifications/settings - Obtener configuración
 * PUT  /api/notifications/settings - Actualizar configuración
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema de validación
const settingsSchema = z.object({
  whatsappEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  evolutionApiUrl: z.string().url().optional().nullable(),
  evolutionApiKey: z.string().optional().nullable(),
  whatsappInstanceName: z.string().optional().nullable(),
  appointmentReminderEnabled: z.boolean().optional(),
  appointmentReminderTimes: z.string().optional().nullable(),
  autoConfirmEnabled: z.boolean().optional(),
});

/**
 * GET - Obtener configuración de notificaciones
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener tenant del usuario (por ahora usamos el primero)
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    // Obtener configuración del tenant
    let settings = await prisma.notificationSettings.findUnique({
      where: { tenantId: tenant.id }
    });

    // Si no existe, crear configuración por defecto
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          whatsappEnabled: false,
          pushEnabled: false,
          emailEnabled: true,
          smsEnabled: false,
          appointmentReminderEnabled: true,
          appointmentReminderTimes: JSON.stringify([1440, 60]), // 24h y 1h antes
          autoConfirmEnabled: false,
          tenantId: tenant.id,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });

  } catch (error: any) {
    console.error('[API] Error al obtener configuración:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Actualizar configuración de notificaciones
 */
export async function PUT(request: NextRequest) {
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
    const validatedData = settingsSchema.parse(body);

    // Obtener tenant del usuario
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    // Buscar configuración existente del tenant
    let settings = await prisma.notificationSettings.findUnique({
      where: { tenantId: tenant.id }
    });

    if (settings) {
      // Actualizar existente
      settings = await prisma.notificationSettings.update({
        where: { id: settings.id },
        data: validatedData,
      });
    } else {
      // Crear nueva
      settings = await prisma.notificationSettings.create({
        data: {
          ...validatedData,
          whatsappEnabled: validatedData.whatsappEnabled ?? false,
          pushEnabled: validatedData.pushEnabled ?? false,
          emailEnabled: validatedData.emailEnabled ?? true,
          smsEnabled: validatedData.smsEnabled ?? false,
          appointmentReminderEnabled: validatedData.appointmentReminderEnabled ?? true,
          autoConfirmEnabled: validatedData.autoConfirmEnabled ?? false,
          tenantId: tenant.id,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });

  } catch (error: any) {
    console.error('[API] Error al actualizar configuración:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}
