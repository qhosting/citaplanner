
/**
 * API endpoints para gestión de asignaciones de profesionales a sucursales
 * Fase 2: Mass Assignment System
 * 
 * GET    /api/branches/[id]/assignments - Obtener asignaciones de una sucursal
 * POST   /api/branches/[id]/assignments - Asignar profesionales a una sucursal (masivo)
 * DELETE /api/branches/[id]/assignments/[assignmentId] - Eliminar asignación
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { BranchAssignmentManager } from '@/lib/services/branchAssignmentManager';
import { MassAssignmentRequest } from '@/lib/types/branchAssignment';

/**
 * GET /api/branches/[id]/assignments
 * Obtiene todas las asignaciones de una sucursal
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

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const assignments = await BranchAssignmentManager.getBranchAssignments(
      params.id,
      session.user.tenantId,
      includeInactive
    );

    return NextResponse.json({
      success: true,
      assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error('Error getting branch assignments:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener asignaciones',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/branches/[id]/assignments
 * Asigna múltiples profesionales a una sucursal
 */
export async function POST(
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

    const body = await request.json();
    const massRequest: MassAssignmentRequest = {
      ...body,
      branchId: params.id,
    };

    // Validar que se proporcionaron profesionales
    if (!massRequest.professionalIds || massRequest.professionalIds.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos un profesional' },
        { status: 400 }
      );
    }

    const result = await BranchAssignmentManager.assignProfessionalsToBranch(
      massRequest,
      session.user.tenantId
    );

    return NextResponse.json({
      success: result.success,
      result,
      message: `${result.created} asignaciones creadas, ${result.updated} actualizadas, ${result.failed} fallidas`,
    });
  } catch (error) {
    console.error('Error in mass assignment:', error);
    return NextResponse.json(
      {
        error: 'Error al asignar profesionales',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
