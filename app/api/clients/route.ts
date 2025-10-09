import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * GET /api/clients
 * Obtiene todos los clientes del tenant actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const clients = await prisma.client.findMany({
      where: {
        tenantId: session.user.tenantId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener los clientes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Crea un nuevo cliente
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, email, address, birthday, notes, tenantId } = body;

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

    // Usar el tenantId de la sesión si no se proporciona
    const finalTenantId = tenantId || session.user.tenantId;

    // Verificar si ya existe un cliente con el mismo teléfono en este tenant
    const existingClient = await prisma.client.findFirst({
      where: {
        phone,
        tenantId: finalTenantId,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un cliente con este número de teléfono' },
        { status: 400 }
      );
    }

    // Crear el cliente
    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        phone,
        email: email || null,
        address: address || null,
        birthday: birthday ? new Date(birthday) : null,
        notes: notes || null,
        tenantId: finalTenantId,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear el cliente' },
      { status: 500 }
    );
  }
}
