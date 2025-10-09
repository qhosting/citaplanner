
/**
 * API: Plantillas de Notificaciones
 * 
 * GET  /api/notifications/templates - Listar plantillas
 * POST /api/notifications/templates - Crear plantilla
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient, NotificationType, NotificationChannel } from '@prisma/client';
import { z } from 'zod';
import { validateTemplate } from '@/lib/utils/templateProcessor';

const prisma = new PrismaClient();

// Schema de validación
const templateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(NotificationChannel),
  subject: z.string().optional().nullable(),
  message: z.string().min(1, 'El contenido es requerido'),
  isActive: z.boolean().optional(),
  tenantId: z.string().min(1, 'El tenant es requerido'),
});

/**
 * GET - Listar plantillas
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as NotificationType | null;
    const channel = searchParams.get('channel') as NotificationChannel | null;
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (type) where.type = type;
    if (channel) where.channel = channel;
    if (isActive !== null) where.isActive = isActive === 'true';

    const templates = await prisma.notificationTemplate.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: templates,
    });

  } catch (error: any) {
    console.error('[API] Error al listar plantillas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al listar plantillas' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear plantilla
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
    const validatedData = templateSchema.parse(body);

    // Validar sintaxis de plantilla
    const templateValidation = validateTemplate(validatedData.message);
    if (!templateValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Plantilla inválida',
          details: templateValidation.errors 
        },
        { status: 400 }
      );
    }

    // Crear plantilla
    const template = await prisma.notificationTemplate.create({
      data: {
        ...validatedData,
        isActive: validatedData.isActive ?? true,
        isDefault: false,
      }
    });

    return NextResponse.json({
      success: true,
      data: template,
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API] Error al crear plantilla:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear plantilla' },
      { status: 500 }
    );
  }
}
