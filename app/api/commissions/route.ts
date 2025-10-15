/**
 * API Routes para gestión de comisiones de profesionales
 * 
 * Endpoints:
 * - GET /api/commissions - Listar comisiones con filtros
 * - POST /api/commissions/record - Registrar comisión manual
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { commissionService } from '@/app/lib/services/commissionService';
import { CommissionStatus } from '@prisma/client';

/**
 * GET - Listar comisiones del tenant con filtros
 * Query params:
 * - professionalId: string (opcional) - Filtrar por profesional
 * - period: string (opcional) - Formato "YYYY-MM"
 * - status: string (opcional) - "PENDING" | "PAID"
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId') || undefined;
    const period = searchParams.get('period') || undefined;
    const statusParam = searchParams.get('status');
    
    const status = statusParam ? 
      (statusParam.toUpperCase() as CommissionStatus) : 
      undefined;

    // Validar status si se proporciona
    if (status && !['PENDING', 'PAID'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Estado inválido. Debe ser PENDING o PAID' },
        { status: 400 }
      );
    }

    // Obtener comisiones
    const commissions = await commissionService.getCommissions(
      session.user.tenantId,
      { professionalId, period, status }
    );

    // Calcular estadísticas
    const stats = {
      totalPending: 0,
      totalPaid: 0,
      totalSales: 0,
      count: commissions.length
    };

    commissions.forEach(commission => {
      if (commission.status === 'PENDING') {
        stats.totalPending += commission.totalCommissions;
      } else {
        stats.totalPaid += commission.totalCommissions;
      }
      stats.totalSales += commission.totalSales;
    });

    return NextResponse.json({
      success: true,
      commissions,
      stats
    });

  } catch (error) {
    console.error('❌ Error al listar comisiones:', error);
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
 * POST - Registrar comisión manual
 * Body: {
 *   professionalId: string
 *   amount: number
 *   saleAmount: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo admin puede registrar comisiones manualmente
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para registrar comisiones' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { professionalId, amount, saleAmount } = body;

    // Validaciones
    if (!professionalId || !amount || !saleAmount) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: professionalId, amount, saleAmount' },
        { status: 400 }
      );
    }

    if (amount < 0 || saleAmount < 0) {
      return NextResponse.json(
        { success: false, error: 'Los montos deben ser positivos' },
        { status: 400 }
      );
    }

    // Registrar comisión
    const commission = await commissionService.recordCommission({
      tenantId: session.user.tenantId,
      professionalId,
      amount,
      saleAmount
    });

    return NextResponse.json({
      success: true,
      commission
    });

  } catch (error) {
    console.error('❌ Error al registrar comisión:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
