import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  createClient,
  listClients,
} from '@/lib/clients/clientService';

/**
 * GET /api/clients
 * List clients with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      tenantId: session.user.tenantId,
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') !== 'false',
      skip: parseInt(searchParams.get('skip') || '0'),
      take: parseInt(searchParams.get('take') || '50'),
    };

    const result = await listClients(filters);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/clients:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Nombre, apellido y teléfono son requeridos' },
        { status: 400 }
      );
    }

    // Log session info for debugging tenant issues
    console.log('📝 Creating client with session:', {
      userId: session.user.id,
      tenantId: session.user.tenantId,
      userEmail: session.user.email,
    });

    // Add tenantId from session
    const clientData = {
      ...body,
      tenantId: session.user.tenantId,
      birthday: body.birthday ? new Date(body.birthday) : undefined,
    };

    const result = await createClient(clientData);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
