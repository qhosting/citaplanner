
/**
 * API Endpoint: Subscribe to Push Notifications
 * POST /api/notifications/push/subscribe
 * 
 * Guarda una nueva subscripción de push notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
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
    const tenantId = (session.user as any).tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant no encontrado' },
        { status: 400 }
      );
    }

    // Parsear body
    const body = await req.json();
    const { endpoint, keys, userAgent } = body;

    // Validar datos requeridos
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { success: false, error: 'Datos de subscripción incompletos' },
        { status: 400 }
      );
    }

    // Marcar subscripciones antiguas del mismo endpoint como inactivas
    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false }
    });

    // Crear nueva subscripción
    const subscription = await prisma.pushSubscription.create({
      data: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
        userId,
        tenantId,
        isActive: true,
        lastUsedAt: new Date()
      }
    });

    console.log('✅ Nueva subscripción push creada:', subscription.id);

    return NextResponse.json({
      success: true,
      data: {
        id: subscription.id,
        endpoint: subscription.endpoint
      }
    });

  } catch (error: any) {
    console.error('❌ Error guardando subscripción push:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
