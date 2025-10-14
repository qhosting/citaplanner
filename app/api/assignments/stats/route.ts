
/**
 * API endpoint para estadísticas de asignaciones
 * Fase 2: Mass Assignment System
 * 
 * GET /api/assignments/stats - Obtener estadísticas generales
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { BranchAssignmentManager } from '@/lib/services/branchAssignmentManager';

/**
 * GET /api/assignments/stats
 * Obtiene estadísticas generales de asignaciones
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const stats = await BranchAssignmentManager.getAssignmentStats(
      session.user.tenantId
    );

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error getting assignment stats:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estadísticas',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
