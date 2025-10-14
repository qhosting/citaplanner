
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { professionalManager } from '@/lib/services/professionalManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('[Professionals API] GET request received');
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log('[Professionals API] Unauthorized - No session');
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    console.log('[Professionals API] Tenant ID not found in session');
    return NextResponse.json({ success: false, error: 'Tenant ID no encontrado' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const search = searchParams.get('search');

    console.log(`[Professionals API] Fetching professionals for tenant: ${tenantId}`);
    
    let professionals;
    if (search) {
      professionals = await professionalManager.searchProfessionals(tenantId, search);
    } else {
      professionals = await professionalManager.getProfessionalsByTenant(tenantId, includeInactive);
    }
    
    console.log(`[Professionals API] Found ${professionals.length} professionals`);
    
    return NextResponse.json({ success: true, data: professionals });
  } catch (error: any) {
    console.error('[Professionals API] GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('[Professionals API] POST request received');
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log('[Professionals API] Unauthorized - No session');
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    console.log('[Professionals API] Tenant ID not found in session');
    return NextResponse.json({ success: false, error: 'Tenant ID no encontrado' }, { status: 400 });
  }

  try {
    const body = await req.json();
    console.log('[Professionals API] Creating professional with data:', { 
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      tenantId
    });

    // Validación de datos requeridos
    if (!body.email || body.email.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'El email es requerido' 
      }, { status: 400 });
    }

    if (!body.firstName || body.firstName.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'El nombre es requerido' 
      }, { status: 400 });
    }

    if (!body.lastName || body.lastName.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'El apellido es requerido' 
      }, { status: 400 });
    }

    const newProfessional = await professionalManager.createProfessional({
      ...body,
      tenantId,
    });
    
    console.log('[Professionals API] Professional created successfully:', newProfessional.id);
    return NextResponse.json({ success: true, data: newProfessional }, { status: 201 });
  } catch (error: any) {
    console.error('[Professionals API] POST error:', error);
    
    // Manejar error de email duplicado
    if (error.message.includes('email ya está registrado')) {
      return NextResponse.json({ 
        success: false, 
        error: 'El email ya está registrado en el sistema' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor al crear el profesional' 
    }, { status: 500 });
  }
}
