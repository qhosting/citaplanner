
/**
 * API endpoints para gestión individual de asignaciones
 * Fase 2: Mass Assignment System
 * 
 * PUT    /api/branches/[id]/assignments/[assignmentId] - Actualizar asignación
 * DELETE /api/branches/[id]/assignments/[assignmentId] - Eliminar asignación
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { BranchAssignmentManager } from '@/lib/services/branchAssignmentManager';

/**
 * PUT /api/branches/[id]/assignments/[assignmentId]
 * Actualiza una asignación específica
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
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

    const updated = await BranchAssignmentManager.updateAssignment(
      params.assignmentId,
      body,
      session.user.tenantId
    );

    return NextResponse.json({
      success: true,
      assignment: updated,
      message: 'Asignación actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      {
        error: 'Error al actualizar asignación',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/branches/[id]/assignments/[assignmentId]
 * Elimina una asignación específica
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await BranchAssignmentManager.deleteAssignment(
      params.assignmentId,
      session.user.tenantId
    );

    return NextResponse.json({
      success: true,
      message: 'Asignación eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      {
        error: 'Error al eliminar asignación',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
