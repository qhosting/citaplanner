
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { branchManager } from '@/lib/services/branchManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Branches API] GET by ID request received:', params.id);
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID no encontrado' }, { status: 400 });
  }

  try {
    const branch = await branchManager.getBranch(params.id, tenantId);
    
    if (!branch) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sucursal no encontrada' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: branch });
  } catch (error: any) {
    console.error('[Branches API] GET by ID error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Branches API] PUT request received:', params.id);
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID no encontrado' }, { status: 400 });
  }

  try {
    const body = await req.json();
    console.log('[Branches API] Updating branch:', params.id);

    const updatedBranch = await branchManager.updateBranch(
      params.id,
      tenantId,
      body
    );
    
    console.log('[Branches API] Branch updated successfully');
    return NextResponse.json({ success: true, data: updatedBranch });
  } catch (error: any) {
    console.error('[Branches API] PUT error:', error);
    
    if (error.message.includes('no encontrada') || error.message.includes('acceso denegado')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sucursal no encontrada o acceso denegado' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor al actualizar la sucursal' 
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Branches API] DELETE request received:', params.id);
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID no encontrado' }, { status: 400 });
  }

  try {
    await branchManager.deleteBranch(params.id, tenantId);
    
    console.log('[Branches API] Branch deleted successfully');
    return NextResponse.json({ success: true, message: 'Sucursal desactivada correctamente' });
  } catch (error: any) {
    console.error('[Branches API] DELETE error:', error);
    
    if (error.message.includes('no encontrada') || error.message.includes('acceso denegado')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sucursal no encontrada o acceso denegado' 
      }, { status: 404 });
    }

    if (error.message.includes('USERS_ASSIGNED')) {
      const count = error.message.split(':')[1];
      return NextResponse.json({ 
        success: false, 
        error: `No se puede eliminar la sucursal porque tiene ${count} usuario(s) asignado(s)` 
      }, { status: 400 });
    }

    if (error.message.includes('APPOINTMENTS_EXIST')) {
      const count = error.message.split(':')[1];
      return NextResponse.json({ 
        success: false, 
        error: `No se puede eliminar la sucursal porque tiene ${count} cita(s) programada(s)` 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor al eliminar la sucursal' 
    }, { status: 500 });
  }
}
