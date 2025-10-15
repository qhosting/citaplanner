/**
 * API Routes para operaciones sobre comisión específica
 * 
 * Endpoints:
 * - PATCH /api/commissions/[id] - Actualizar estado de comisión
 * - GET /api/commissions/[id] - Obtener detalle de comisión
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { commissionService } from '@/app/lib/services/commissionService';
import prisma from '@/app/lib/prisma';

/**
 * GET - Obtener detalle de comisión específica
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

    const commission = await prisma.professionalCommission.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      },
      include: {
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!commission) {
      return NextResponse.json(
        { success: false, error: 'Comisión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      commission
    });

  } catch (error) {
    console.error('❌ Error al obtener comisión:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Actualizar estado de comisión (marcar como pagada)
 * Body: {
 *   action: "mark_as_paid"
 *   notes?: string
 * }
 */
export async function PATCH(
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

    // Solo admin puede marcar comisiones como pagadas
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para actualizar comisiones' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, notes } = body;

    if (action !== 'mark_as_paid') {
      return NextResponse.json(
        { success: false, error: 'Acción inválida. Debe ser "mark_as_paid"' },
        { status: 400 }
      );
    }

    // Verificar que la comisión existe y pertenece al tenant
    const existingCommission = await prisma.professionalCommission.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    });

    if (!existingCommission) {
      return NextResponse.json(
        { success: false, error: 'Comisión no encontrada' },
        { status: 404 }
      );
    }

    if (existingCommission.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'La comisión ya está marcada como pagada' },
        { status: 400 }
      );
    }

    // Marcar como pagada
    const commission = await commissionService.markAsPaid(
      params.id,
      session.user.tenantId,
      notes
    );

    return NextResponse.json({
      success: true,
      commission,
      message: 'Comisión marcada como pagada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al actualizar comisión:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
