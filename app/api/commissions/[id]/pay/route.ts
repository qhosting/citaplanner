
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { commissionService } from '@/services/commissionService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { notes } = await request.json();

    const commission = await commissionService.markAsPaid(params.id, tenantId, notes);
    return NextResponse.json(commission);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
