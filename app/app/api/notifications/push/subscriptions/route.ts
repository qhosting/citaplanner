
/**
 * API Endpoint: Get Push Subscriptions
 * GET /api/notifications/push/subscriptions
 * 
 * Lista las subscripciones activas del usuario actual
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Obtener subscripciones activas
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        id: true,
        endpoint: true,
        userAgent: true,
        lastUsedAt: true,
        createdAt: true
      },
      orderBy: {
        lastUsedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: subscriptions
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo subscripciones push:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
