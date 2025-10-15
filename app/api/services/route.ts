import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * GET /api/services
 * Obtiene todos los servicios del tenant actual
 * Query params opcionales:
 * - isActive: boolean (filtrar por estado activo/inactivo)
 * - category: string (filtrar por categoría)
 * - search: string (buscar por nombre o descripción)
 * - limit: number (límite de resultados para paginación)
 * - offset: number (offset para paginación)
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
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Construir el where clause
    const where: any = {
      tenantId: session.user.tenantId,
    };

    // Filtrar por estado activo/inactivo si se especifica
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === 'true';
    }

    // Filtrar por categoría si se especifica
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Buscar por nombre o descripción si se especifica
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Construir query con paginación opcional
    const queryOptions: any = {
      where,
      orderBy: {
        name: 'asc',
      },
      include: {
        category: true,
        serviceUsers: {
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
        },
      },
    };

    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    if (offset) {
      queryOptions.skip = parseInt(offset);
    }

    const services = await prisma.service.findMany(queryOptions);

    // Obtener total de servicios para paginación
    const total = await prisma.service.count({ where });

    return NextResponse.json({
      success: true,
      data: services,
      meta: {
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener los servicios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services
 * Crea un nuevo servicio
 * Body requerido:
 * - name: string (requerido)
 * - duration: number (requerido, en minutos, entre 5 y 480)
 * - price: number (requerido, >= 0)
 * Opcionales:
 * - description: string
 * - categoryId: string
 * - color: string
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

    const body = await request.json();
    const { name, description, duration, price, categoryId, color } = body;

    // Validaciones requeridas
    if (!name || !duration || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: 'Nombre, duración y precio son requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de datos
    if (typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'El nombre debe ser un texto' },
        { status: 400 }
      );
    }

    // Validar duración
    const durationNum = Number(duration);
    if (isNaN(durationNum) || durationNum < 5 || durationNum > 480) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La duración debe ser un número entre 5 y 480 minutos (8 horas)' 
        },
        { status: 400 }
      );
    }

    // Validar precio
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0 || priceNum > 999999.99) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El precio debe ser un número entre 0 y 999999.99' 
        },
        { status: 400 }
      );
    }

    // Validar que el nombre sea único en este tenant
    const existingService = await prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        tenantId: session.user.tenantId,
      },
    });

    if (existingService) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un servicio con este nombre' },
        { status: 400 }
      );
    }

    // Validar categoryId si se proporciona
    if (categoryId) {
      const category = await prisma.serviceCategory.findFirst({
        where: {
          id: categoryId,
          tenantId: session.user.tenantId,
        },
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: 'La categoría especificada no existe o no pertenece a tu cuenta' },
          { status: 400 }
        );
      }
    }

    // Crear el servicio
    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        duration: durationNum,
        price: priceNum,
        categoryId: categoryId || null,
        color: color || '#3B82F6',
        tenantId: session.user.tenantId,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: service,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear el servicio' },
      { status: 500 }
    );
  }
}
