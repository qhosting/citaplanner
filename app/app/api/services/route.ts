
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { serviceManager } from '@/lib/services/serviceManager';

// Configuración explícita de runtime para Next.js 14
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('[Services API] GET request received');
  
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
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    console.log(`[Services API] Fetching services for tenant: ${tenantId}, includeInactive: ${includeInactive}`);
    
    const services = await serviceManager.getServicesByTenant(tenantId, includeInactive);
    console.log(`[Services API] Found ${services.length} services`);
    
    return NextResponse.json({ success: true, data: services });
  } catch (error: any) {
    console.error('[Services API] GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('[Services API] POST request received');
  
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
    console.log('[Services API] Creating service with data:', { 
      name: body.name, 
      tenantId,
      hasDescription: !!body.description,
      price: body.price,
      duration: body.duration
    });

    // Validación de datos requeridos
    if (!body.name || body.name.trim() === '') {
      console.log('[Services API] Validation error: name is required');
      return NextResponse.json({ 
        success: false, 
        error: 'El nombre del servicio es requerido' 
      }, { status: 400 });
    }

    if (body.price === undefined || body.price === null || body.price < 0) {
      console.log('[Services API] Validation error: invalid price');
      return NextResponse.json({ 
        success: false, 
        error: 'El precio debe ser un valor válido mayor o igual a 0' 
      }, { status: 400 });
    }

    if (!body.duration || body.duration < 5) {
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

    const newService = await serviceManager.createService({
      ...cleanedData,
      tenantId,
    });
    
    console.log('[Services API] Service created successfully:', newService.id);
    return NextResponse.json({ success: true, data: newService }, { status: 201 });
  } catch (error: any) {
    console.error('[Services API] POST error:', error);
    console.error('[Services API] Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor al crear el servicio' 
    }, { status: 500 });
  }
}
