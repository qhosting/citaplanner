/**
 * API: Notification Preferences
 * 
 * GET /api/notifications/preferences - Obtener preferencias
 * PATCH /api/notifications/preferences - Actualizar preferencias
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener o crear preferencias
    let preferences = await prisma.userNotificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      // Crear preferencias por defecto
      preferences = await prisma.userNotificationPreferences.create({
        data: {
          userId: session.user.id,
          tenantId: session.user.tenantId,
        },
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Actualizar preferencias
    const preferences = await prisma.userNotificationPreferences.upsert({
      where: { userId: session.user.id },
      update: body,
      create: {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        ...body,
      },
    });

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
