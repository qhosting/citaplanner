import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * GET /api/services/[id]
 * Obtiene un servicio específico por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        category: true,
        serviceUsers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        appointments: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 5,
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener el servicio' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/services/[id]
 * Actualiza un servicio existente
 * Body opcional (se actualizan solo los campos proporcionados):
 * - name: string
 * - description: string
 * - duration: number (en minutos, entre 5 y 480)
 * - price: number (>= 0)
 * - categoryId: string
 * - color: string
 * - isActive: boolean
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos (solo ADMIN, SUPER_ADMIN, MANAGER pueden actualizar servicios)
    const userRole = session.user.role;
    if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para actualizar servicios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, duration, price, categoryId, color, isActive } = body;

    // Verificar que el servicio existe y pertenece al tenant
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    // Validar datos de entrada
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'El nombre debe ser un texto válido' },
          { status: 400 }
        );
      }

      // Verificar que el nombre sea único (si se cambió)
      if (name.trim() !== existingService.name) {
        const duplicateService = await prisma.service.findFirst({
          where: {
            name: {
              equals: name.trim(),
              mode: 'insensitive',
            },
            tenantId: session.user.tenantId,
            id: {
              not: params.id,
            },
          },
        });

        if (duplicateService) {
          return NextResponse.json(
            { success: false, error: 'Ya existe otro servicio con este nombre' },
            { status: 400 }
          );
        }
      }

      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (duration !== undefined) {
      const durationNum = Number(duration);
      if (isNaN(durationNum) || durationNum < 5 || durationNum > 480) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'La duración debe ser un número entre 5 y 480 minutos (8 horas)' 
          },
          { status: 400 }
        );
      }
      updateData.duration = durationNum;
    }

    if (price !== undefined) {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum < 0 || priceNum > 999999.99) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'El precio debe ser un número entre 0 y 999999.99' 
          },
          { status: 400 }
        );
      }
      updateData.price = priceNum;
    }

    if (categoryId !== undefined) {
      if (categoryId === null || categoryId === '') {
        updateData.categoryId = null;
      } else {
        // Validar que la categoría existe y pertenece al tenant
        const category = await prisma.serviceCategory.findFirst({
          where: {
            id: categoryId,
            tenantId: session.user.tenantId,
          },
        });

        if (!category) {
          return NextResponse.json(
            { success: false, error: 'La categoría especificada no existe o no pertenece a tu cuenta' },
            { status: 400 }
          );
        }
        updateData.categoryId = categoryId;
      }
    }

    if (color !== undefined) {
      updateData.color = color || '#3B82F6';
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // Actualizar el servicio
    const updatedService = await prisma.service.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        category: true,
        serviceUsers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedService,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el servicio' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/[id]
 * Elimina (desactiva) un servicio
 * Soft delete: marca el servicio como inactivo en lugar de eliminarlo
 * Verifica que no tenga citas futuras antes de desactivar
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos (solo ADMIN, SUPER_ADMIN, MANAGER pueden eliminar servicios)
    const userRole = session.user.role;
    if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar servicios' },
        { status: 403 }
      );
    }

    // Verificar que el servicio existe y pertenece al tenant
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que no tenga citas futuras
    const futureAppointmentsCount = await prisma.appointment.count({
      where: {
        serviceId: params.id,
        startTime: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
    });

    if (futureAppointmentsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No se puede desactivar el servicio porque tiene ${futureAppointmentsCount} cita(s) futura(s) programada(s)` 
        },
        { status: 400 }
      );
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    const deletedService = await prisma.service.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: deletedService,
      message: 'Servicio desactivado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el servicio' },
      { status: 500 }
    );
  }
}
