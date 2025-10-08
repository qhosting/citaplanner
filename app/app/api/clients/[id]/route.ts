import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  getClient,
  updateClient,
  deleteClient,
} from '@/lib/clients/clientService';

/**
 * GET /api/clients/[id]
 * Get a specific client by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const result = await getClient(params.id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    // Verify client belongs to user's tenant
    if (result.data.tenantId !== session.user.tenantId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/clients/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/[id]
 * Update a client
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Verify client exists and belongs to user's tenant
    const existingClient = await getClient(params.id);
    if (!existingClient.success) {
      return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404 });
    }

    if (existingClient.data.tenantId !== session.user.tenantId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const updateData = {
      id: params.id,
      ...body,
      tenantId: session.user.tenantId,
      birthday: body.birthday ? new Date(body.birthday) : undefined,
    };

    const result = await updateClient(updateData);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PUT /api/clients/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[id]
 * Soft delete a client
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    // Verify client exists and belongs to user's tenant
    const existingClient = await getClient(params.id);
    if (!existingClient.success) {
      return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404 });
    }

    if (existingClient.data.tenantId !== session.user.tenantId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const result = await deleteClient(params.id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/clients/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
