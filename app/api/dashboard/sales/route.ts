
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { reportService } from '@/services/reportService';
import { productService } from '@/services/productService';
import { commissionService } from '@/services/commissionService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // day, week, month

    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get sales report
    const salesReport = await reportService.getSalesReport(tenantId, {
      startDate,
      endDate,
      groupBy: 'day',
    });

    // Get top products and services
    const topProducts = await reportService.getTopProducts(tenantId, startDate, endDate, 5);
    const topServices = await reportService.getTopServices(tenantId, startDate, endDate, 5);

    // Get low stock products
    const lowStockProducts = await productService.getLowStockProducts(tenantId);

    // Get pending commissions
    const pendingCommissions = await commissionService.getCommissions(tenantId, {
      status: 'PENDING',
    });

    const totalPendingCommissions = pendingCommissions.reduce(
      (sum, comm) => sum + comm.totalCommissions,
      0
    );

    return NextResponse.json({
      period,
      salesSummary: salesReport.summary,
      salesTrend: salesReport.groupedData,
      topProducts,
      topServices,
      lowStockAlerts: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 5),
      pendingCommissions: {
        count: pendingCommissions.length,
        total: totalPendingCommissions,
        items: pendingCommissions.slice(0, 5),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
