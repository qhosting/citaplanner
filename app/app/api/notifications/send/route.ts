
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { notificationManager } from '@/lib/notifications/notificationManager';
import { NotificationType } from '@prisma/client';

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
    const { type, recipient, subject, message, appointmentId } = await req.json();

    if (!type || !recipient || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await notificationManager.sendNotification({
      type: type as NotificationType,
      recipient,
      subject,
      message,
      tenantId,
      appointmentId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Send notification error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
