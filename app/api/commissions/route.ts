
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

    const filters: any = {};
    
    if (searchParams.get('professionalId')) {
      filters.professionalId = searchParams.get('professionalId')!;
    }
    if (searchParams.get('period')) {
      filters.period = searchParams.get('period')!;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as any;
    }

    const commissions = await commissionService.getCommissions(tenantId, filters);
    return NextResponse.json(commissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
