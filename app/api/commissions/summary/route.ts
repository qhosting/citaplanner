
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { commissionService } from '@/lib/services/commissionService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const searchParams = request.nextUrl.searchParams;
    const professionalId = searchParams.get('professionalId');
    const period = searchParams.get('period') || undefined;

    if (!professionalId) {
      return NextResponse.json({ error: 'professionalId is required' }, { status: 400 });
    }

    const summary = await commissionService.getCommissionSummary(
      tenantId,
      professionalId,
      period
    );

    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
