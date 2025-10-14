
/**
 * API Routes para gestión de horarios de profesionales
 * 
 * Endpoints:
 * - GET /api/professionals/[id]/schedule - Obtener horario
 * - PUT /api/professionals/[id]/schedule - Actualizar horario
 * - POST /api/professionals/[id]/schedule/exceptions - Agregar excepción
 * - DELETE /api/professionals/[id]/schedule/exceptions/[exceptionId] - Eliminar excepción
 * - GET /api/professionals/[id]/schedule/availability - Consultar disponibilidad
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';
import { ScheduleManager } from '@/app/lib/services/scheduleManager';
import { 
  ScheduleConfig, 
  ScheduleException,
  AvailabilityQuery 
} from '@/app/lib/types/schedule';

/**
 * GET - Obtener horario de un profesional
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

    const professionalId = params.id;

    // Buscar profesional
    const professional = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        tenantId: session.user.tenantId
      }
    });

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Obtener configuración de horario
    let scheduleConfig: ScheduleConfig;
    
    if (professional.scheduleConfig) {
      scheduleConfig = professional.scheduleConfig as ScheduleConfig;
    } else {
      // Crear configuración por defecto
      scheduleConfig = ScheduleManager.createDefaultConfig(session.user.id);
    }

    // Calcular estadísticas
    const stats = ScheduleManager.calculateStats(scheduleConfig);

    return NextResponse.json({
      success: true,
      data: {
        professionalId: professional.id,
        professionalName: professional.name,
        schedule: scheduleConfig,
        stats
      }
    });

  } catch (error) {
    console.error('Error al obtener horario:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener horario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Actualizar horario completo de un profesional
 */
export async function PUT(
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

    const professionalId = params.id;
    const body = await request.json();
    const { schedule } = body;

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Configuración de horario requerida' },
        { status: 400 }
      );
    }

    // Validar configuración
    const validation = ScheduleManager.validateScheduleConfig(schedule);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuración de horario inválida',
          errors: validation.errors,
          warnings: validation.warnings
        },
        { status: 400 }
      );
    }

    // Buscar profesional
    const professional = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        tenantId: session.user.tenantId
      }
    });

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar horario
    const updatedSchedule: ScheduleConfig = {
      ...schedule,
      lastUpdated: new Date().toISOString(),
      updatedBy: session.user.id
    };

    const updated = await prisma.professional.update({
      where: { id: professionalId },
      data: {
        scheduleConfig: updatedSchedule as any
      }
    });

    // Calcular estadísticas
    const stats = ScheduleManager.calculateStats(updatedSchedule);

    return NextResponse.json({
      success: true,
      message: 'Horario actualizado exitosamente',
      data: {
        professionalId: updated.id,
        schedule: updatedSchedule,
        stats
      }
    });

  } catch (error) {
    console.error('Error al actualizar horario:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar horario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Agregar excepción al horario
 */
export async function POST(
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

    const professionalId = params.id;
    const body = await request.json();
    const { exception } = body;

    if (!exception) {
      return NextResponse.json(
        { success: false, error: 'Datos de excepción requeridos' },
        { status: 400 }
      );
    }

    // Buscar profesional
    const professional = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        tenantId: session.user.tenantId
      }
    });

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Obtener configuración actual
    let currentConfig: ScheduleConfig;
    if (professional.scheduleConfig) {
      currentConfig = professional.scheduleConfig as ScheduleConfig;
    } else {
      currentConfig = ScheduleManager.createDefaultConfig(session.user.id);
    }

    // Agregar excepción
    const updatedConfig = ScheduleManager.addException(
      currentConfig,
      exception,
      session.user.id
    );

    // Guardar
    await prisma.professional.update({
      where: { id: professionalId },
      data: {
        scheduleConfig: updatedConfig as any
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Excepción agregada exitosamente',
      data: {
        exception: updatedConfig.exceptions[updatedConfig.exceptions.length - 1]
      }
    });

  } catch (error) {
    console.error('Error al agregar excepción:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al agregar excepción',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
