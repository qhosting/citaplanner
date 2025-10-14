
/**
 * API endpoint para obtener profesionales disponibles para asignar
 * Fase 2: Mass Assignment System
 * 
 * GET /api/branches/[id]/assignments/available - Obtener profesionales disponibles
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { BranchAssignmentManager } from '@/lib/services/branchAssignmentManager';

/**
 * GET /api/branches/[id]/assignments/available
 * Obtiene profesionales disponibles para asignar a la sucursal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const professionals = await BranchAssignmentManager.getAvailableProfessionals(
      params.id,
      session.user.tenantId
    );

    return NextResponse.json({
      success: true,
      professionals,
      count: professionals.length,
    });
  } catch (error) {
    console.error('Error getting available professionals:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener profesionales disponibles',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
