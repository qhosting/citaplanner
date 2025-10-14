
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { professionalManager } from '@/lib/services/professionalManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Professionals API] GET by ID request received:', params.id);
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID no encontrado' }, { status: 400 });
  }

  try {
    const professional = await professionalManager.getProfessional(params.id, tenantId);
    
    if (!professional) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profesional no encontrado' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: professional });
  } catch (error: any) {
    console.error('[Professionals API] GET by ID error:', error);
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
  console.log('[Professionals API] PUT request received:', params.id);
  
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
    console.log('[Professionals API] Updating professional:', params.id);

    const updatedProfessional = await professionalManager.updateProfessional(
      params.id,
      tenantId,
      body
    );
    
    console.log('[Professionals API] Professional updated successfully');
    return NextResponse.json({ success: true, data: updatedProfessional });
  } catch (error: any) {
    console.error('[Professionals API] PUT error:', error);
    
    if (error.message.includes('no encontrado') || error.message.includes('acceso denegado')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profesional no encontrado o acceso denegado' 
      }, { status: 404 });
    }

    if (error.message.includes('email ya está registrado')) {
      return NextResponse.json({ 
        success: false, 
        error: 'El email ya está registrado en el sistema' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor al actualizar el profesional' 
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Professionals API] DELETE request received:', params.id);
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID no encontrado' }, { status: 400 });
  }

  try {
    await professionalManager.deleteProfessional(params.id, tenantId);
    
    console.log('[Professionals API] Professional deleted successfully');
    return NextResponse.json({ success: true, message: 'Profesional desactivado correctamente' });
  } catch (error: any) {
    console.error('[Professionals API] DELETE error:', error);
    
    if (error.message.includes('no encontrado') || error.message.includes('acceso denegado')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profesional no encontrado o acceso denegado' 
      }, { status: 404 });
    }

    if (error.message.includes('APPOINTMENTS_EXIST')) {
      const count = error.message.split(':')[1];
      return NextResponse.json({ 
        success: false, 
        error: `No se puede eliminar el profesional porque tiene ${count} cita(s) programada(s)` 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor al eliminar el profesional' 
    }, { status: 500 });
  }
}
