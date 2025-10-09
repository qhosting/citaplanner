
/**
 * API Endpoint: Unsubscribe from Push Notifications
 * DELETE /api/notifications/push/unsubscribe
 * 
 * Marca una subscripción como inactiva
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Parsear body
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint requerido' },
        { status: 400 }
      );
    }

    // Marcar subscripción como inactiva
    const result = await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false }
    });

    console.log(`✅ Subscripción push desactivada: ${endpoint}`);

    return NextResponse.json({
      success: true,
      data: {
        unsubscribed: result.count > 0
      }
    });

  } catch (error: any) {
    console.error('❌ Error desactivando subscripción push:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
