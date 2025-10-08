
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { serviceManager } from '@/lib/services/serviceManager';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID not found' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const services = await serviceManager.getServicesByTenant(tenantId, includeInactive);
    return NextResponse.json({ success: true, data: services });
  } catch (error: any) {
    console.error('Services API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID not found' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const newService = await serviceManager.createService({
      ...body,
      tenantId,
    });
    return NextResponse.json({ success: true, data: newService }, { status: 201 });
  } catch (error: any) {
    console.error('Services API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
