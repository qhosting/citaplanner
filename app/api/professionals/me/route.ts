/**
 * GET /api/professionals/me
 * 
 * Obtiene los datos del profesional del usuario autenticado
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Buscar professional asociado al usuario
    const professional = await prisma.professional.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!professional) {
      return NextResponse.json(
        { success: false, message: 'No se encontró perfil de profesional' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      professional,
    });
  } catch (error: any) {
    console.error('Error al obtener datos del profesional:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error al obtener datos del profesional' 
      },
      { status: 500 }
    );
  }
}
