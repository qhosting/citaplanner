import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * GET /api/clients/[id]
 * Obtiene un cliente específico por ID
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

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        appointments: {
          orderBy: {
            startTime: 'desc',
          },
          take: 10,
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener el cliente' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/[id]
 * Actualiza un cliente existente
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

    const body = await request.json();
    const { firstName, lastName, phone, email, address, birthday, notes, isActive } = body;

    // Verificar que el cliente existe y pertenece al tenant
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Validaciones
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Nombre, apellido y teléfono son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el teléfono tenga al menos 10 dígitos
    if (phone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'El teléfono debe tener al menos 10 dígitos' },
        { status: 400 }
      );
    }

    // Si se cambió el teléfono, verificar que no exista otro cliente con ese teléfono
    if (phone !== existingClient.phone) {
      const duplicateClient = await prisma.client.findFirst({
        where: {
          phone,
          tenantId: session.user.tenantId,
          id: {
            not: params.id,
          },
        },
      });

      if (duplicateClient) {
        return NextResponse.json(
          { success: false, error: 'Ya existe otro cliente con este número de teléfono' },
          { status: 400 }
        );
      }
    }

    // Actualizar el cliente
    const updatedClient = await prisma.client.update({
      where: {
        id: params.id,
      },
      data: {
        firstName,
        lastName,
        phone,
        email: email || null,
        address: address || null,
        birthday: birthday ? new Date(birthday) : null,
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : existingClient.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedClient,
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el cliente' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[id]
 * Elimina (desactiva) un cliente
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

    // Verificar que el cliente existe y pertenece al tenant
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    const deletedClient = await prisma.client.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: deletedClient,
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el cliente' },
      { status: 500 }
    );
  }
}
