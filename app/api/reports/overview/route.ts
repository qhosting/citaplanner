
/**
 * API Endpoint: Reporte General (Overview)
 * GET /api/reports/overview
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReportManager } from '@/lib/services/reportManager';
import { ReportPeriod, ReportFilters } from '@/lib/types/reports';

export async function GET(request: NextRequest) {
  try {
    // Autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Parsear parámetros
    const period = (searchParams.get('period') || 'month') as ReportPeriod;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construir filtros
    const filters: ReportFilters = {
      period,
      tenantId: session.user.tenantId
    };

    // Si hay fechas personalizadas
    if (startDate && endDate) {
      filters.period = ReportPeriod.CUSTOM;
      filters.dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    }

    // Generar reporte
    const report = await ReportManager.generateOverviewReport(filters);

    return NextResponse.json({
      success: true,
      data: report,
      generatedAt: new Date(),
      filters
    });

  } catch (error: any) {
    console.error('Error generating overview report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate report',
        code: 'REPORT_GENERATION_ERROR'
      },
      { status: 500 }
    );
  }
}
