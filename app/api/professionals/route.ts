/**
 * API Routes para gestión de profesionales
 * 
 * Endpoints:
 * - GET /api/professionals - Listar todos los profesionales del tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

/**
 * GET - Listar profesionales del tenant
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
    const branchId = searchParams.get('branchId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Construir filtros
    const where: any = {
      tenantId: session.user.tenantId,
      role: 'PROFESSIONAL'
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (!includeInactive) {
      where.isActive = true;
    }

    // Buscar profesionales
    const professionals = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        isActive: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            name: true
          }
        },
        // Relaciones útiles
        workingHours: {
          where: {
            isActive: true
          }
        },
        branchAssignments: {
          where: {
            isActive: true
          },
          include: {
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            appointments: true,
            workingHours: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    // Formatear respuesta
    const formattedProfessionals = professionals.map(prof => ({
      id: prof.id,
      name: `${prof.firstName} ${prof.lastName}`,
      user: {
        firstName: prof.firstName,
        lastName: prof.lastName,
        email: prof.email,
        phone: prof.phone,
        avatar: prof.avatar
      },
      email: prof.email,
      phone: prof.phone,
      avatar: prof.avatar,
      isActive: prof.isActive,
      branch: prof.branch,
      workingHoursCount: prof._count.workingHours,
      appointmentsCount: prof._count.appointments,
      branchAssignments: prof.branchAssignments,
      hasScheduleConfig: prof.workingHours.length > 0
    }));

    return NextResponse.json({
      success: true,
      professionals: formattedProfessionals,
      count: formattedProfessionals.length
    });

  } catch (error) {
    console.error('❌ Error al listar profesionales:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
