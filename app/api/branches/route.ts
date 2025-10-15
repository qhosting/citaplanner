import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * GET /api/branches
 * Obtiene todas las sucursales del tenant actual
 * Query params opcionales:
 * - isActive: boolean (filtrar por estado activo/inactivo)
 * - search: string (buscar por nombre, dirección o teléfono)
 * - limit: number (límite de resultados para paginación, default: 50, max: 100)
 * - offset: number (offset para paginación, default: 0)
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

    // Obtener query parameters
    const searchParams = request.nextUrl.searchParams;
    const isActiveParam = searchParams.get('isActive');
    const search = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Validar y procesar parámetros de paginación
    let limit = 50; // default
    let offset = 0; // default

    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { success: false, error: 'El límite debe ser un número positivo' },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 100); // max 100
    }

    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { success: false, error: 'El offset debe ser un número no negativo' },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Construir el where clause
    const where: any = {
      tenantId: session.user.tenantId,
    };

    // Filtrar por estado activo/inactivo si se especifica
    if (isActiveParam !== null) {
      if (isActiveParam !== 'true' && isActiveParam !== 'false') {
        return NextResponse.json(
          { success: false, error: 'isActive debe ser "true" o "false"' },
          { status: 400 }
        );
      }
      where.isActive = isActiveParam === 'true';
    }

    // Buscar por nombre, dirección o teléfono si se especifica
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Obtener sucursales con paginación
    const branches = await prisma.branch.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Conteos de relaciones
        _count: {
          select: {
            users: true,
            appointments: true,
            payments: true,
            professionalAssignments: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    // Obtener total de sucursales para paginación
    const total = await prisma.branch.count({ where });

    // Calcular estadísticas
    const stats = await prisma.branch.groupBy({
      by: ['isActive'],
      where: {
        tenantId: session.user.tenantId,
      },
      _count: true,
    });

    const activeCount = stats.find((s) => s.isActive)?._count || 0;
    const inactiveCount = stats.find((s) => !s.isActive)?._count || 0;

    return NextResponse.json({
      success: true,
      data: {
        branches,
        total,
        stats: {
          active: activeCount,
          inactive: inactiveCount,
        },
      },
      meta: {
        limit,
        offset,
        hasMore: offset + branches.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener las sucursales' },
      { status: 500 }
    );
  }
}
