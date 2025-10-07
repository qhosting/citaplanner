
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { notificationManager } from '@/lib/notifications/notificationManager';

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
    const results = await notificationManager.testAllChannels(tenantId);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Test notifications error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
