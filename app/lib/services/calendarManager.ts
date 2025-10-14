/**
 * Calendar Manager Service - Phase 4
 * 
 * Servicio central para gestionar el calendario de profesionales
 * Integra horarios, citas, disponibilidad y validaciones
 */

import { PrismaClient, AppointmentStatus, Prisma } from '@prisma/client';
import { 
  CalendarEvent, 
  CalendarFilters, 
  ProfessionalAvailability,
  AvailabilityBlock,
  AvailabilityValidation,
  ValidateAvailabilityOptions,
  CalendarStatistics,
  ScheduleExceptionInfo,
  createCalendarEventFromAppointment
} from '../types/calendar';
import { ScheduleManager } from './scheduleManager';
import { startOfDay, endOfDay, eachDayOfInterval, format, addMinutes, isWithinInterval, parseISO } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Clase principal para gestión de calendario
 */
export class CalendarManager {
  private static readonly DEFAULT_SLOT_DURATION = 30; // minutos
  private static readonly DEFAULT_WORKING_HOURS = { start: '08:00', end: '20:00' };

  /**
   * Obtiene eventos del calendario de un profesional
   */
  static async getCalendarEvents(
    filters: CalendarFilters,
    requestingUserId: string,
    requestingUserRole: string
  ): Promise<{ events: CalendarEvent[]; availability: ProfessionalAvailability }> {
    // Validar permisos
    await this.validateCalendarAccess(
      filters.professionalId!,
      requestingUserId,
      requestingUserRole
    );

    // Construir query de appointments
    const where: Prisma.AppointmentWhereInput = {
      professionalId: filters.professionalId,
      startTime: {
        gte: filters.startDate,
      },
      endTime: {
        lte: filters.endDate,
      },
    };

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status as AppointmentStatus;
    }

    if (filters.serviceId) {
      where.serviceId = filters.serviceId;
    }

    // Obtener citas
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
        branch: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Convertir a eventos de calendario
    const events = appointments.map(createCalendarEventFromAppointment);

    // Obtener disponibilidad
    const availability = await this.getProfessionalAvailability(
      filters.professionalId!,
      filters.startDate,
      filters.endDate,
      filters.branchId
    );

    return { events, availability };
  }

  /**
   * Obtiene la disponibilidad de un profesional en un rango de fechas
   */
  static async getProfessionalAvailability(
    professionalId: string,
    startDate: Date,
    endDate: Date,
    branchId?: string
  ): Promise<ProfessionalAvailability> {
    // Obtener professional con horarios
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        schedules: true,
        scheduleExceptions: {
          where: {
            OR: [
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate },
              },
            ],
          },
        },
        branchAssignments: {
          where: branchId ? { branchId } : {},
          include: {
            branch: true,
          },
        },
      },
    });

    if (!professional) {
      throw new Error('Profesional no encontrado');
    }

    // Construir bloques de disponibilidad
    const blocks: AvailabilityBlock[] = [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of days) {
      const dayOfWeek = format(day, 'EEEE').toUpperCase();
      
      // Buscar horario para este día
      const schedule = professional.schedules.find(s => s.dayOfWeek === dayOfWeek);
      
      if (schedule && schedule.isAvailable) {
        // Crear bloques de tiempo para este día
        const dayStart = new Date(day);
        dayStart.setHours(
          parseInt(schedule.startTime.split(':')[0]),
          parseInt(schedule.startTime.split(':')[1]),
          0
        );

        const dayEnd = new Date(day);
        dayEnd.setHours(
          parseInt(schedule.endTime.split(':')[0]),
          parseInt(schedule.endTime.split(':')[1]),
          0
        );

        // Verificar si hay override por sucursal
        let overrideApplied = false;
        if (branchId) {
          const assignment = professional.branchAssignments.find(
            a => a.branchId === branchId && a.scheduleOverride
          );
          if (assignment && assignment.scheduleOverride) {
            // Aplicar override
            const override = assignment.scheduleOverride as any;
            const overrideDay = override[dayOfWeek.toLowerCase()];
            if (overrideDay && overrideDay.isAvailable) {
              const overrideStart = new Date(day);
              overrideStart.setHours(
                parseInt(overrideDay.startTime.split(':')[0]),
                parseInt(overrideDay.startTime.split(':')[1]),
                0
              );
              const overrideEnd = new Date(day);
              overrideEnd.setHours(
                parseInt(overrideDay.endTime.split(':')[0]),
                parseInt(overrideDay.endTime.split(':')[1]),
                0
              );
              
              blocks.push({
                id: `override-${day.toISOString()}-${branchId}`,
                start: overrideStart,
                end: overrideEnd,
                isAvailable: true,
                type: 'override',
                branchId,
              });
              overrideApplied = true;
            }
          }
        }

        // Si no hay override, usar horario regular
        if (!overrideApplied) {
          blocks.push({
            id: `regular-${day.toISOString()}`,
            start: dayStart,
            end: dayEnd,
            isAvailable: true,
            type: 'regular',
          });
        }
      }
    }

    // Procesar excepciones (vacaciones, bajas)
    const exceptions: ScheduleExceptionInfo[] = professional.scheduleExceptions.map(exc => ({
      id: exc.id,
      startDate: new Date(exc.startDate),
      endDate: new Date(exc.endDate),
      reason: exc.reason,
      type: exc.type as any,
      isRecurring: exc.isRecurring,
    }));

    // Marcar bloques afectados por excepciones
    for (const exception of exceptions) {
      blocks.forEach(block => {
        if (
          isWithinInterval(block.start, { start: exception.startDate, end: exception.endDate }) ||
          isWithinInterval(block.end, { start: exception.startDate, end: exception.endDate })
        ) {
          block.isAvailable = false;
          block.type = 'exception';
          block.reason = exception.reason;
        }
      });
    }

    return {
      professionalId,
      startDate,
      endDate,
      blocks,
      exceptions,
    };
  }

  /**
   * Valida si se puede crear/mover una cita en un horario específico
   */
  static async validateAvailability(
    options: ValidateAvailabilityOptions
  ): Promise<AvailabilityValidation> {
    const { professionalId, startTime, endTime, branchId, excludeAppointmentId } = options;

    // 1. Verificar que el profesional existe
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        schedules: true,
        scheduleExceptions: true,
      },
    });

    if (!professional) {
      return {
        isValid: false,
        reason: 'Profesional no encontrado',
      };
    }

    // 2. Verificar disponibilidad en horario
    const availability = await this.getProfessionalAvailability(
      professionalId,
      startOfDay(startTime),
      endOfDay(endTime),
      branchId
    );

    const isWithinAvailableBlock = availability.blocks.some(
      block =>
        block.isAvailable &&
        startTime >= block.start &&
        endTime <= block.end
    );

    if (!isWithinAvailableBlock) {
      return {
        isValid: false,
        reason: 'Horario no disponible para este profesional',
        availabilityIssues: ['El horario está fuera de los bloques de disponibilidad'],
      };
    }

    // 3. Verificar que no haya excepciones
    const hasException = availability.exceptions.some(
      exc =>
        (startTime >= exc.startDate && startTime < exc.endDate) ||
        (endTime > exc.startDate && endTime <= exc.endDate)
    );

    if (hasException) {
      return {
        isValid: false,
        reason: 'El profesional tiene una excepción en este horario',
        availabilityIssues: ['Vacaciones o baja médica'],
      };
    }

    // 4. Verificar solapamiento con otras citas
    const where: Prisma.AppointmentWhereInput = {
      professionalId,
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
      OR: [
        {
          startTime: {
            lt: endTime,
          },
          endTime: {
            gt: startTime,
          },
        },
      ],
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    const conflictingAppointments = await prisma.appointment.findMany({
      where,
      select: { id: true },
    });

    if (conflictingAppointments.length > 0) {
      return {
        isValid: false,
        reason: 'Ya existe una cita en este horario',
        conflictingAppointments: conflictingAppointments.map(a => a.id),
      };
    }

    // Todo válido
    return {
      isValid: true,
    };
  }

  /**
   * Valida acceso al calendario de un profesional
   */
  private static async validateCalendarAccess(
    professionalId: string,
    requestingUserId: string,
    requestingUserRole: string
  ): Promise<void> {
    // Admin puede ver todo
    if (requestingUserRole === 'ADMIN' || requestingUserRole === 'SUPER_ADMIN') {
      return;
    }

    // Profesional solo puede ver su propio calendario
    if (requestingUserRole === 'PROFESSIONAL') {
      const professional = await prisma.professional.findFirst({
        where: {
          userId: requestingUserId,
          id: professionalId,
        },
      });

      if (!professional) {
        throw new Error('No tienes permiso para ver este calendario');
      }
      return;
    }

    // Gerente puede ver calendarios de profesionales de sus sucursales
    if (requestingUserRole === 'MANAGER') {
      const user = await prisma.user.findUnique({
        where: { id: requestingUserId },
        include: {
          managedBranches: true,
        },
      });

      if (!user || !user.managedBranches || user.managedBranches.length === 0) {
        throw new Error('No tienes sucursales asignadas');
      }

      const branchIds = user.managedBranches.map(b => b.id);
      
      const professional = await prisma.professional.findUnique({
        where: { id: professionalId },
        include: {
          branchAssignments: true,
        },
      });

      if (!professional) {
        throw new Error('Profesional no encontrado');
      }

      const hasAccess = professional.branchAssignments.some(
        assignment => branchIds.includes(assignment.branchId)
      );

      if (!hasAccess) {
        throw new Error('No tienes permiso para ver este calendario');
      }
      return;
    }

    throw new Error('No tienes permiso para acceder a calendarios');
  }

  /**
   * Obtiene estadísticas del calendario
   */
  static async getCalendarStatistics(
    professionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarStatistics> {
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        startTime: {
          gte: startDate,
        },
        endTime: {
          lte: endDate,
        },
      },
      include: {
        service: true,
      },
    });

    const appointmentsByStatus = {
      PENDING: appointments.filter(a => a.status === 'PENDING').length,
      CONFIRMED: appointments.filter(a => a.status === 'CONFIRMED').length,
      IN_PROGRESS: appointments.filter(a => a.status === 'IN_PROGRESS').length,
      COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
      CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
      NO_SHOW: appointments.filter(a => a.status === 'NO_SHOW').length,
    };

    const totalAppointments = appointments.length;

    // Calcular duración promedio
    const totalDuration = appointments.reduce((sum, apt) => {
      const duration = (apt.endTime.getTime() - apt.startTime.getTime()) / (1000 * 60);
      return sum + duration;
    }, 0);
    const averageAppointmentDuration = totalAppointments > 0 ? totalDuration / totalAppointments : 0;

    // Calcular horas pico
    const hourCounts: Record<number, number> = {};
    appointments.forEach(apt => {
      const hour = apt.startTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calcular días pico
    const dayCounts: Record<string, number> = {};
    appointments.forEach(apt => {
      const day = format(apt.startTime, 'EEEE');
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const peakDays = Object.entries(dayCounts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count);

    // Calcular tasa de utilización
    const availability = await this.getProfessionalAvailability(
      professionalId,
      startDate,
      endDate
    );
    
    const totalAvailableMinutes = availability.blocks
      .filter(b => b.isAvailable)
      .reduce((sum, block) => {
        return sum + (block.end.getTime() - block.start.getTime()) / (1000 * 60);
      }, 0);

    const totalBookedMinutes = appointments
      .filter(a => a.status !== 'CANCELLED' && a.status !== 'NO_SHOW')
      .reduce((sum, apt) => {
        return sum + (apt.endTime.getTime() - apt.startTime.getTime()) / (1000 * 60);
      }, 0);

    const utilizationRate = totalAvailableMinutes > 0 
      ? (totalBookedMinutes / totalAvailableMinutes) * 100 
      : 0;

    return {
      professionalId,
      period: { start: startDate, end: endDate },
      totalAppointments,
      appointmentsByStatus,
      utilizationRate,
      averageAppointmentDuration,
      peakHours,
      peakDays,
    };
  }

  /**
   * Obtiene slots disponibles para agendar
   */
  static async getAvailableSlots(
    professionalId: string,
    date: Date,
    serviceDuration: number,
    branchId?: string
  ): Promise<Date[]> {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Obtener disponibilidad
    const availability = await this.getProfessionalAvailability(
      professionalId,
      dayStart,
      dayEnd,
      branchId
    );

    // Obtener citas existentes
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const slots: Date[] = [];

    // Iterar sobre bloques disponibles
    for (const block of availability.blocks) {
      if (!block.isAvailable) continue;

      let currentSlot = new Date(block.start);
      const blockEnd = new Date(block.end);

      while (currentSlot < blockEnd) {
        const slotEnd = addMinutes(currentSlot, serviceDuration);

        // Verificar que el slot termina dentro del bloque
        if (slotEnd > blockEnd) break;

        // Verificar que no se solapa con citas existentes
        const hasConflict = existingAppointments.some(
          apt =>
            (currentSlot >= apt.startTime && currentSlot < apt.endTime) ||
            (slotEnd > apt.startTime && slotEnd <= apt.endTime) ||
            (currentSlot <= apt.startTime && slotEnd >= apt.endTime)
        );

        if (!hasConflict) {
          slots.push(new Date(currentSlot));
        }

        // Avanzar al siguiente slot
        currentSlot = addMinutes(currentSlot, this.DEFAULT_SLOT_DURATION);
      }
    }

    return slots;
  }
}

export default CalendarManager;
