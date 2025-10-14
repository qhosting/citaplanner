
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { branchManager } from '@/lib/services/branchManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('[Branches API] GET request received');
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log('[Branches API] Unauthorized - No session');
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    console.log('[Branches API] Tenant ID not found in session');
    return NextResponse.json({ success: false, error: 'Tenant ID no encontrado' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const search = searchParams.get('search');

    console.log(`[Branches API] Fetching branches for tenant: ${tenantId}`);
    
    let branches;
    if (search) {
      branches = await branchManager.searchBranches(tenantId, search);
    } else {
      branches = await branchManager.getBranchesByTenant(tenantId, includeInactive);
    }
    
    console.log(`[Branches API] Found ${branches.length} branches`);
    
    return NextResponse.json({ success: true, data: branches });
  } catch (error: any) {
    console.error('[Branches API] GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('[Branches API] POST request received');
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log('[Branches API] Unauthorized - No session');
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    console.log('[Branches API] Tenant ID not found in session');
    return NextResponse.json({ success: false, error: 'Tenant ID no encontrado' }, { status: 400 });
  }

  try {
    const body = await req.json();
    console.log('[Branches API] Creating branch with data:', { 
      name: body.name,
      tenantId
    });

    // Validación de datos requeridos
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'El nombre de la sucursal es requerido' 
      }, { status: 400 });
    }

    const newBranch = await branchManager.createBranch({
      ...body,
      tenantId,
    });
    
    console.log('[Branches API] Branch created successfully:', newBranch.id);
    return NextResponse.json({ success: true, data: newBranch }, { status: 201 });
  } catch (error: any) {
    console.error('[Branches API] POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor al crear la sucursal' 
    }, { status: 500 });
  }
}
