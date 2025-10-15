/**
 * API Route para obtener resumen de comisiones de un profesional
 * 
 * Endpoint:
 * - GET /api/commissions/professional/[id] - Resumen de comisiones del profesional
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { commissionService } from '@/app/lib/services/commissionService';

/**
 * GET - Obtener resumen de comisiones de un profesional
 * Query params:
 * - period: string (opcional) - Formato "YYYY-MM"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Si es profesional, solo puede ver sus propias comisiones
    if (session.user.role === 'PROFESSIONAL' && session.user.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver estas comisiones' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || undefined;

    const summary = await commissionService.getCommissionSummary(
      session.user.tenantId,
      params.id,
      period
    );

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('❌ Error al obtener resumen de comisiones:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
