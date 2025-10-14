
/**
 * Schedule Manager Service
 * 
 * Servicio para gestionar horarios de profesionales, validar disponibilidad
 * y calcular slots disponibles para citas.
 */

import { 
  ScheduleConfig, 
  DaySchedule, 
  TimeBlock, 
  ScheduleException,
  AvailableSlot,
  AvailabilityQuery,
  ScheduleValidationResult,
  ScheduleStats,
  DayOfWeek,
  ExceptionType,
  DEFAULT_SCHEDULE
} from '../types/schedule';

/**
 * Clase principal para gestión de horarios
 */
export class ScheduleManager {
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly DEFAULT_TIMEZONE = 'America/Mexico_City';
  private static readonly DEFAULT_SLOT_INTERVAL = 30; // minutos

  /**
   * Crea una configuración de horario por defecto
   */
  static createDefaultConfig(userId?: string): ScheduleConfig {
    return {
      version: this.CURRENT_VERSION,
      defaultSchedule: DEFAULT_SCHEDULE,
      exceptions: [],
      timezone: this.DEFAULT_TIMEZONE,
      lastUpdated: new Date().toISOString(),
      updatedBy: userId
    };
  }

  /**
   * Valida una configuración de horario
   */
  static validateScheduleConfig(config: ScheduleConfig): ScheduleValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar versión
    if (!config.version || !config.version.match(/^\d+\.\d+\.\d+$/)) {
      errors.push('Versión de configuración inválida');
    }

    // Validar que existan los 7 días
    if (!config.defaultSchedule || config.defaultSchedule.length !== 7) {
      errors.push('El horario debe incluir los 7 días de la semana');
    }

    // Validar cada día
    config.defaultSchedule?.forEach((daySchedule) => {
      if (!Object.values(DayOfWeek).includes(daySchedule.day)) {
        errors.push(`Día inválido: ${daySchedule.day}`);
      }

      if (daySchedule.isWorkingDay && daySchedule.timeBlocks.length === 0) {
        warnings.push(`${daySchedule.day} está marcado como día laboral pero no tiene bloques de tiempo`);
      }

      // Validar bloques de tiempo
      daySchedule.timeBlocks.forEach((block, index) => {
        const validation = this.validateTimeBlock(block);
        if (!validation.isValid) {
          errors.push(`${daySchedule.day} - Bloque ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      // Validar que no haya solapamientos
      const overlaps = this.findOverlappingBlocks(daySchedule.timeBlocks);
      if (overlaps.length > 0) {
        errors.push(`${daySchedule.day}: Bloques de tiempo solapados`);
      }
    });

    // Validar excepciones
    config.exceptions?.forEach((exception, index) => {
      if (!exception.date || !exception.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        errors.push(`Excepción ${index + 1}: Fecha inválida`);
      }

      if (!Object.values(ExceptionType).includes(exception.type)) {
        errors.push(`Excepción ${index + 1}: Tipo inválido`);
      }

      if (exception.isAvailable && exception.timeBlocks) {
        exception.timeBlocks.forEach((block, blockIndex) => {
          const validation = this.validateTimeBlock(block);
          if (!validation.isValid) {
            errors.push(`Excepción ${index + 1} - Bloque ${blockIndex + 1}: ${validation.errors.join(', ')}`);
          }
        });
      }
    });

    // Validar timezone
    if (!config.timezone) {
      errors.push('Zona horaria requerida');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida un bloque de tiempo individual
   */
  static validateTimeBlock(block: TimeBlock): ScheduleValidationResult {
    const errors: string[] = [];

    // Validar formato
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(block.startTime)) {
      errors.push('Hora de inicio inválida (formato: HH:mm)');
    }
    if (!timeRegex.test(block.endTime)) {
      errors.push('Hora de fin inválida (formato: HH:mm)');
    }

    // Validar que la hora de fin sea posterior a la de inicio
    if (block.startTime && block.endTime) {
      const start = this.timeToMinutes(block.startTime);
      const end = this.timeToMinutes(block.endTime);
      
      if (end <= start) {
        errors.push('La hora de fin debe ser posterior a la hora de inicio');
      }

      // Validar duración mínima (15 minutos)
      if (end - start < 15) {
        errors.push('La duración mínima de un bloque es 15 minutos');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Encuentra bloques de tiempo solapados
   */
  static findOverlappingBlocks(blocks: TimeBlock[]): [number, number][] {
    const overlaps: [number, number][] = [];
    
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (this.blocksOverlap(blocks[i], blocks[j])) {
          overlaps.push([i, j]);
        }
      }
    }
    
    return overlaps;
  }

  /**
   * Verifica si dos bloques se solapan
   */
  static blocksOverlap(block1: TimeBlock, block2: TimeBlock): boolean {
    const start1 = this.timeToMinutes(block1.startTime);
    const end1 = this.timeToMinutes(block1.endTime);
    const start2 = this.timeToMinutes(block2.startTime);
    const end2 = this.timeToMinutes(block2.endTime);

    return (start1 < end2 && end1 > start2);
  }

  /**
   * Convierte tiempo HH:mm a minutos desde medianoche
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convierte minutos desde medianoche a formato HH:mm
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Obtiene el horario para una fecha específica
   * Considera excepciones y horario regular
   */
  static getScheduleForDate(config: ScheduleConfig, date: Date): DaySchedule | null {
    const dateStr = this.formatDate(date);
    
    // Buscar excepción para esta fecha
    const exception = config.exceptions.find(e => e.date === dateStr);
    
    if (exception) {
      if (!exception.isAvailable) {
        return null; // No disponible este día
      }
      
      // Retornar horario de excepción
      return {
        day: this.getDayOfWeek(date),
        isWorkingDay: true,
        timeBlocks: exception.timeBlocks || []
      };
    }

    // Retornar horario regular
    const dayOfWeek = this.getDayOfWeek(date);
    return config.defaultSchedule.find(d => d.day === dayOfWeek) || null;
  }

  /**
   * Calcula slots disponibles para un rango de fechas
   */
  static calculateAvailableSlots(
    config: ScheduleConfig,
    query: AvailabilityQuery,
    existingAppointments: Array<{ date: Date; startTime: string; endTime: string }>
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const slotInterval = query.slotInterval || this.DEFAULT_SLOT_INTERVAL;
    const serviceDuration = query.serviceDuration || slotInterval;

    // Iterar por cada día en el rango
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const daySchedule = this.getScheduleForDate(config, currentDate);
      
      if (daySchedule && daySchedule.isWorkingDay) {
        // Para cada bloque de tiempo del día
        daySchedule.timeBlocks.forEach(block => {
          const daySlots = this.generateSlotsForBlock(
            currentDate,
            block,
            slotInterval,
            serviceDuration,
            existingAppointments,
            query.professionalId,
            query.branchId
          );
          slots.push(...daySlots);
        });
      }

      // Siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  /**
   * Genera slots para un bloque de tiempo específico
   */
  private static generateSlotsForBlock(
    date: Date,
    block: TimeBlock,
    slotInterval: number,
    serviceDuration: number,
    existingAppointments: Array<{ date: Date; startTime: string; endTime: string }>,
    professionalId: string,
    branchId?: string
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    const dateStr = this.formatDate(date);
    
    const startMinutes = this.timeToMinutes(block.startTime);
    const endMinutes = this.timeToMinutes(block.endTime);

    // Generar slots cada slotInterval minutos
    for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += slotInterval) {
      const slotStart = this.minutesToTime(minutes);
      const slotEnd = this.minutesToTime(minutes + serviceDuration);

      // Verificar si el slot está ocupado
      const isOccupied = existingAppointments.some(apt => {
        if (this.formatDate(apt.date) !== dateStr) return false;
        
        const aptStart = this.timeToMinutes(apt.startTime);
        const aptEnd = this.timeToMinutes(apt.endTime);
        const slotStartMin = minutes;
        const slotEndMin = minutes + serviceDuration;

        return (slotStartMin < aptEnd && slotEndMin > aptStart);
      });

      if (!isOccupied) {
        slots.push({
          date: dateStr,
          startTime: slotStart,
          endTime: slotEnd,
          professionalId,
          branchId
        });
      }
    }

    return slots;
  }

  /**
   * Verifica si un profesional está disponible en un horario específico
   */
  static isAvailable(
    config: ScheduleConfig,
    date: Date,
    startTime: string,
    endTime: string,
    existingAppointments: Array<{ date: Date; startTime: string; endTime: string }>
  ): boolean {
    const daySchedule = this.getScheduleForDate(config, date);
    
    if (!daySchedule || !daySchedule.isWorkingDay) {
      return false;
    }

    const requestStart = this.timeToMinutes(startTime);
    const requestEnd = this.timeToMinutes(endTime);

    // Verificar que el horario solicitado esté dentro de algún bloque de trabajo
    const isWithinWorkingHours = daySchedule.timeBlocks.some(block => {
      const blockStart = this.timeToMinutes(block.startTime);
      const blockEnd = this.timeToMinutes(block.endTime);
      return requestStart >= blockStart && requestEnd <= blockEnd;
    });

    if (!isWithinWorkingHours) {
      return false;
    }

    // Verificar que no haya conflicto con citas existentes
    const dateStr = this.formatDate(date);
    const hasConflict = existingAppointments.some(apt => {
      if (this.formatDate(apt.date) !== dateStr) return false;
      
      const aptStart = this.timeToMinutes(apt.startTime);
      const aptEnd = this.timeToMinutes(apt.endTime);

      return (requestStart < aptEnd && requestEnd > aptStart);
    });

    return !hasConflict;
  }

  /**
   * Calcula estadísticas del horario
   */
  static calculateStats(config: ScheduleConfig): ScheduleStats {
    let totalMinutes = 0;
    let workingDays = 0;

    config.defaultSchedule.forEach(day => {
      if (day.isWorkingDay) {
        workingDays++;
        day.timeBlocks.forEach(block => {
          const start = this.timeToMinutes(block.startTime);
          const end = this.timeToMinutes(block.endTime);
          totalMinutes += (end - start);
        });
      }
    });

    const totalHours = totalMinutes / 60;
    const averageHoursPerDay = workingDays > 0 ? totalHours / workingDays : 0;

    // Contar excepciones futuras
    const today = new Date();
    const upcomingExceptions = config.exceptions.filter(e => {
      const exDate = new Date(e.date);
      return exDate >= today;
    }).length;

    return {
      totalWorkingHours: Math.round(totalHours * 100) / 100,
      workingDays,
      averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
      totalExceptions: config.exceptions.length,
      upcomingExceptions
    };
  }

  /**
   * Agrega una excepción al horario
   */
  static addException(
    config: ScheduleConfig,
    exception: Omit<ScheduleException, 'id'>,
    userId?: string
  ): ScheduleConfig {
    const newException: ScheduleException = {
      ...exception,
      id: this.generateExceptionId()
    };

    return {
      ...config,
      exceptions: [...config.exceptions, newException],
      lastUpdated: new Date().toISOString(),
      updatedBy: userId
    };
  }

  /**
   * Elimina una excepción del horario
   */
  static removeException(
    config: ScheduleConfig,
    exceptionId: string,
    userId?: string
  ): ScheduleConfig {
    return {
      ...config,
      exceptions: config.exceptions.filter(e => e.id !== exceptionId),
      lastUpdated: new Date().toISOString(),
      updatedBy: userId
    };
  }

  /**
   * Actualiza el horario de un día específico
   */
  static updateDaySchedule(
    config: ScheduleConfig,
    day: DayOfWeek,
    schedule: Omit<DaySchedule, 'day'>,
    userId?: string
  ): ScheduleConfig {
    const updatedSchedule = config.defaultSchedule.map(d => 
      d.day === day ? { ...schedule, day } : d
    );

    return {
      ...config,
      defaultSchedule: updatedSchedule,
      lastUpdated: new Date().toISOString(),
      updatedBy: userId
    };
  }

  /**
   * Helpers
   */
  private static getDayOfWeek(date: Date): DayOfWeek {
    const days = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY
    ];
    return days[date.getDay()];
  }

  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private static generateExceptionId(): string {
    return `exc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ScheduleManager;
