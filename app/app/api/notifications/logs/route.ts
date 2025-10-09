
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
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const logs = await prisma.notificationLog.findMany({
      where: {
        tenantId,
        ...(appointmentId ? { appointmentId } : {}),
        ...(type ? { type: type as any } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        appointment: {
          include: {
            client: true,
            service: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('Notification logs error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
