
/**
 * API Endpoint: Reporte de Profesional
 * GET /api/reports/professional/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReportManager } from '@/lib/services/reportManager';
import { ReportPeriod, ReportFilters } from '@/lib/types/reports';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const professionalId = params.id;
    const searchParams = request.nextUrl.searchParams;

    // Parsear parámetros
    const period = (searchParams.get('period') || 'month') as ReportPeriod;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construir filtros
    const filters: ReportFilters = {
      period,
      professionalId,
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
    const report = await ReportManager.generateProfessionalReport(filters);

    return NextResponse.json({
      success: true,
      data: report,
      generatedAt: new Date(),
      filters
    });

  } catch (error: any) {
    console.error('Error generating professional report:', error);
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
