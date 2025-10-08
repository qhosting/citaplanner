
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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
    const templates = await prisma.notificationTemplate.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    console.error('Templates API error:', error);
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
    const newTemplate = await prisma.notificationTemplate.create({
      data: {
        ...body,
        tenantId,
      },
    });
    return NextResponse.json({ success: true, data: newTemplate }, { status: 201 });
  } catch (error: any) {
    console.error('Templates API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
