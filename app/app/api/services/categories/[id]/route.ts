
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID not found' }, { status: 400 });
  }

  try {
    const category = await prisma.serviceCategory.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error('Service category API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updatedCategory = await prisma.serviceCategory.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error: any) {
    console.error('Service category API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Tenant ID not found' }, { status: 400 });
  }

  try {
    await prisma.serviceCategory.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Service category API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
