
/**
 * API: Plantilla Individual
 * 
 * GET    /api/notifications/templates/[id] - Obtener plantilla
 * PUT    /api/notifications/templates/[id] - Actualizar plantilla
 * DELETE /api/notifications/templates/[id] - Eliminar plantilla
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient, NotificationType, NotificationChannel } from '@prisma/client';
import { z } from 'zod';
import { validateTemplate } from '@/lib/utils/templateProcessor';

const prisma = new PrismaClient();

// Schema de validación
const templateUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.nativeEnum(NotificationType).optional(),
  channel: z.nativeEnum(NotificationChannel).optional(),
  subject: z.string().optional().nullable(),
  message: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET - Obtener plantilla específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const template = await prisma.notificationTemplate.findUnique({
      where: { id: params.id }
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Plantilla no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });

  } catch (error: any) {
    console.error('[API] Error al obtener plantilla:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener plantilla' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Actualizar plantilla
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = templateUpdateSchema.parse(body);

    // Si se actualiza el contenido, validar sintaxis
    if (validatedData.message) {
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
    }

    // Verificar que existe
    const existing = await prisma.notificationTemplate.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Plantilla no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar
    const template = await prisma.notificationTemplate.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: template,
    });

  } catch (error: any) {
    console.error('[API] Error al actualizar plantilla:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar plantilla' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar plantilla
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que existe
    const existing = await prisma.notificationTemplate.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Plantilla no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar (o hacer soft delete desactivando)
    await prisma.notificationTemplate.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Plantilla desactivada exitosamente' },
    });

  } catch (error: any) {
    console.error('[API] Error al eliminar plantilla:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar plantilla' },
      { status: 500 }
    );
  }
}
