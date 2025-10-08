
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { commissionService } from '@/lib/services/commissionService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { notes } = await request.json();

    const commission = await commissionService.markAsPaid(id, tenantId, notes);
    return NextResponse.json(commission);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
