
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { serviceManager } from '@/lib/services/serviceManager';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const categories = await serviceManager.getCategoriesByTenant(tenantId, includeInactive);
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const newCategory = await serviceManager.createCategory({
      ...body,
      tenantId,
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
