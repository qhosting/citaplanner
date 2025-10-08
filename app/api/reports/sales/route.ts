
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { reportService } from '@/lib/services/reportService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const searchParams = request.nextUrl.searchParams;

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const filters: any = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    if (searchParams.get('groupBy')) {
      filters.groupBy = searchParams.get('groupBy') as any;
    }
    if (searchParams.get('productId')) {
      filters.productId = searchParams.get('productId')!;
    }
    if (searchParams.get('serviceId')) {
      filters.serviceId = searchParams.get('serviceId')!;
    }
    if (searchParams.get('professionalId')) {
      filters.professionalId = searchParams.get('professionalId')!;
    }
    if (searchParams.get('clientId')) {
      filters.clientId = searchParams.get('clientId')!;
    }
    if (searchParams.get('paymentMethod')) {
      filters.paymentMethod = searchParams.get('paymentMethod')!;
    }

    const report = await reportService.getSalesReport(tenantId, filters);
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
