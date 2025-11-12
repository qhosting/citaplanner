/**
 * API: Chatwoot Configuration
 * 
 * Endpoint para obtener y gestionar la configuración de Chatwoot
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { getChatwootConfigForTenant } from '@/lib/chatwoot/server';
import { z } from 'zod';

// Schema de validación para crear/actualizar configuración
const chatwootConfigSchema = z.object({
  websiteToken: z.string().min(1, 'El token del sitio web es requerido'),
  baseUrl: z.string().url('URL inválida'),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  position: z.enum(['left', 'right']).default('right'),
  locale: z.string().default('es'),
  widgetColor: z.string().optional(),
  branchId: z.string().optional().nullable(),
});

/**
 * GET - Obtener configuración de Chatwoot para el tenant actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Usuario sin tenant asociado' },
        { status: 400 }
      );
    }

    // Obtener configuración de Chatwoot
    const config = await getChatwootConfigForTenant(user.tenantId);

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('Error obteniendo configuración de Chatwoot:', error);
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
 * POST - Crear nueva configuración de Chatwoot (solo ADMIN)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Usuario sin tenant asociado' },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea ADMIN
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para esta acción' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = chatwootConfigSchema.parse(body);

    // Si se marca como default, desmarcar otras configuraciones default
    if (validatedData.isDefault) {
      await prisma.chatwootConfig.updateMany({
        where: {
          tenantId: user.tenantId,
          isDefault: true,
          branchId: validatedData.branchId || null,
        },
        data: { isDefault: false },
      });
    }

    // Crear la nueva configuración
    const config = await prisma.chatwootConfig.create({
      data: {
        ...validatedData,
        tenantId: user.tenantId,
      },
    });

    return NextResponse.json({
      success: true,
      config,
      message: 'Configuración de Chatwoot creada exitosamente',
    });
  } catch (error: any) {
    console.error('Error creando configuración de Chatwoot:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de validación inválidos',
          details: error.errors,
        },
        { status: 400 }
      );
    }

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
 * PUT - Actualizar configuración de Chatwoot (solo ADMIN)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Usuario sin tenant asociado' },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea ADMIN
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para esta acción' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de configuración requerido' },
        { status: 400 }
      );
    }

    const validatedData = chatwootConfigSchema.partial().parse(updateData);

    // Verificar que la configuración pertenece al tenant
    const existingConfig = await prisma.chatwootConfig.findUnique({
      where: { id },
    });

    if (!existingConfig || existingConfig.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Configuración no encontrada' },
        { status: 404 }
      );
    }

    // Si se marca como default, desmarcar otras configuraciones default
    if (validatedData.isDefault) {
      await prisma.chatwootConfig.updateMany({
        where: {
          tenantId: user.tenantId,
          isDefault: true,
          branchId: existingConfig.branchId,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    // Actualizar la configuración
    const config = await prisma.chatwootConfig.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      config,
      message: 'Configuración de Chatwoot actualizada exitosamente',
    });
  } catch (error: any) {
    console.error('Error actualizando configuración de Chatwoot:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de validación inválidos',
          details: error.errors,
        },
        { status: 400 }
      );
    }

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
 * DELETE - Eliminar configuración de Chatwoot (solo ADMIN)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Usuario sin tenant asociado' },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea ADMIN
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para esta acción' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de configuración requerido' },
        { status: 400 }
      );
    }

    // Verificar que la configuración pertenece al tenant
    const existingConfig = await prisma.chatwootConfig.findUnique({
      where: { id },
    });

    if (!existingConfig || existingConfig.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Configuración no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la configuración
    await prisma.chatwootConfig.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Configuración de Chatwoot eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error eliminando configuración de Chatwoot:', error);
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
