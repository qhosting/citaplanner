
/**
 * API endpoints para gestión de asignaciones de un profesional
 * Fase 2: Mass Assignment System
 * 
 * GET  /api/professionals/[id]/assignments - Obtener asignaciones de un profesional
 * POST /api/professionals/[id]/assignments - Asignar profesional a múltiples sucursales
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { BranchAssignmentManager } from '@/lib/services/branchAssignmentManager';
import { MassAssignmentToBranchesRequest } from '@/lib/types/branchAssignment';

/**
 * GET /api/professionals/[id]/assignments
 * Obtiene todas las asignaciones de un profesional
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

    const assignments = await BranchAssignmentManager.getProfessionalAssignments(
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
    console.error('Error getting professional assignments:', error);
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
 * POST /api/professionals/[id]/assignments
 * Asigna un profesional a múltiples sucursales
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
    const massRequest: MassAssignmentToBranchesRequest = {
      ...body,
      professionalId: params.id,
    };

    // Validar que se proporcionaron sucursales
    if (!massRequest.branchIds || massRequest.branchIds.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos una sucursal' },
        { status: 400 }
      );
    }

    const result = await BranchAssignmentManager.assignProfessionalToBranches(
      massRequest,
      session.user.tenantId
    );

    return NextResponse.json({
      success: result.success,
      result,
      message: `${result.created} asignaciones creadas, ${result.updated} actualizadas, ${result.failed} fallidas`,
    });
  } catch (error) {
    console.error('Error in mass assignment to branches:', error);
    return NextResponse.json(
      {
        error: 'Error al asignar sucursales',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
