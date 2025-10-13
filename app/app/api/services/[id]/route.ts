
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { serviceManager } from '@/lib/services/serviceManager';

// Configuración explícita de runtime para Next.js 14
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Services API] GET by ID request received:', params.id);
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID not found' }, { status: 400 });
  }

  try {
    const service = await serviceManager.getServiceById(params.id, tenantId);
    
    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error: any) {
    console.error('Service API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Services API] PUT request received for ID:', params.id);
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log('[Services API] Unauthorized - No session');
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    console.log('[Services API] Tenant ID not found in session');
    return NextResponse.json({ success: false, error: 'Tenant ID not found' }, { status: 400 });
  }

  try {
    const body = await req.json();
    console.log('[Services API] Updating service with data:', { 
      id: params.id,
      name: body.name, 
      tenantId,
      hasDescription: !!body.description,
      price: body.price,
      duration: body.duration
    });

    // Validación de datos si están presentes
    if (body.name !== undefined && (!body.name || body.name.trim() === '')) {
      console.log('[Services API] Validation error: name cannot be empty');
      return NextResponse.json({ 
        success: false, 
        error: 'El nombre del servicio no puede estar vacío' 
      }, { status: 400 });
    }

    if (body.price !== undefined && (body.price === null || body.price < 0)) {
      console.log('[Services API] Validation error: invalid price');
      return NextResponse.json({ 
        success: false, 
        error: 'El precio debe ser un valor válido mayor o igual a 0' 
      }, { status: 400 });
    }

    if (body.duration !== undefined && (body.duration === null || body.duration < 5)) {
      console.log('[Services API] Validation error: invalid duration');
      return NextResponse.json({ 
        success: false, 
        error: 'La duración debe ser al menos 5 minutos' 
      }, { status: 400 });
    }

    // Limpiar categoryId si es cadena vacía
    const cleanedData = {
      ...body,
      categoryId: body.categoryId === '' ? null : body.categoryId,
    };

    const updatedService = await serviceManager.updateService(params.id, tenantId, cleanedData);
    console.log('[Services API] Service updated successfully:', updatedService.id);
    return NextResponse.json({ success: true, data: updatedService });
  } catch (error: any) {
    console.error('[Services API] PUT error:', error);
    console.error('[Services API] Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor al actualizar el servicio' 
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Services API] DELETE request received for ID:', params.id);
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log('[Services API] Unauthorized - No session');
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    console.log('[Services API] Tenant ID not found in session');
    return NextResponse.json({ success: false, error: 'ID de tenant no encontrado' }, { status: 400 });
  }

  try {
    console.log('[Services API] Attempting to delete service:', { serviceId: params.id, tenantId });
    await serviceManager.deleteService(params.id, tenantId);
    console.log('[Services API] Service deleted successfully:', params.id);
    return NextResponse.json({ 
      success: true, 
      message: 'Servicio eliminado exitosamente' 
    });
  } catch (error: any) {
    console.error('[Services API] DELETE error:', error);
    console.error('[Services API] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    // Manejar error de citas asociadas
    if (error.message && error.message.startsWith('APPOINTMENTS_EXIST:')) {
      const appointmentCount = error.message.split(':')[1];
      console.log(`[Services API] Cannot delete service - ${appointmentCount} appointments exist`);
      return NextResponse.json({ 
        success: false, 
        error: `No se puede eliminar el servicio porque tiene ${appointmentCount} cita(s) asociada(s)`,
        details: {
          reason: 'APPOINTMENTS_EXIST',
          appointmentCount: parseInt(appointmentCount),
          suggestion: 'Puede desactivar el servicio en lugar de eliminarlo para mantener el historial de citas'
        }
      }, { status: 400 });
    }

    // Manejar error de restricción de clave foránea (P2003)
    if (error.code === 'P2003') {
      console.log('[Services API] Foreign key constraint violation detected');
      return NextResponse.json({ 
        success: false, 
        error: 'No se puede eliminar el servicio porque tiene registros asociados (citas, ventas, etc.)',
        details: {
          reason: 'FOREIGN_KEY_CONSTRAINT',
          suggestion: 'Puede desactivar el servicio en lugar de eliminarlo para mantener la integridad de los datos'
        }
      }, { status: 400 });
    }

    // Manejar error de servicio no encontrado
    if (error.message === 'Service not found or access denied') {
      console.log('[Services API] Service not found or access denied');
      return NextResponse.json({ 
        success: false, 
        error: 'Servicio no encontrado o acceso denegado' 
      }, { status: 404 });
    }

    // Error genérico
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor al eliminar el servicio' 
    }, { status: 500 });
  }
}
