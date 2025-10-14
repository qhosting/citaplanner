
/**
 * Sistema de Gestión de Horarios Detallados
 * 
 * Este módulo define los tipos y estructuras de datos para el sistema
 * de horarios de profesionales en CitaPlanner.
 */

/**
 * Días de la semana
 */
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

/**
 * Mapeo de días en español
 */
export const DAY_NAMES_ES: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Lunes',
  [DayOfWeek.TUESDAY]: 'Martes',
  [DayOfWeek.WEDNESDAY]: 'Miércoles',
  [DayOfWeek.THURSDAY]: 'Jueves',
  [DayOfWeek.FRIDAY]: 'Viernes',
  [DayOfWeek.SATURDAY]: 'Sábado',
  [DayOfWeek.SUNDAY]: 'Domingo'
};

/**
 * Tipo de excepción de horario
 */
export enum ExceptionType {
  VACATION = 'VACATION',        // Vacaciones
  SICK_LEAVE = 'SICK_LEAVE',    // Baja médica
  SPECIAL_DAY = 'SPECIAL_DAY',  // Día especial
  HOLIDAY = 'HOLIDAY',          // Festivo
  CUSTOM = 'CUSTOM'             // Personalizado
}

/**
 * Bloque de tiempo individual
 * Representa un período de tiempo continuo (ej: 9:00 - 13:00)
 */
export interface TimeBlock {
  startTime: string;  // Formato HH:mm (24h)
  endTime: string;    // Formato HH:mm (24h)
}

/**
 * Horario de un día específico
 * Puede tener múltiples bloques (ej: mañana y tarde)
 */
export interface DaySchedule {
  day: DayOfWeek;
  isWorkingDay: boolean;
  timeBlocks: TimeBlock[];
}

/**
 * Excepción de horario
 * Representa días especiales donde el horario normal no aplica
 */
export interface ScheduleException {
  id?: string;
  date: string;           // Formato YYYY-MM-DD
  type: ExceptionType;
  reason?: string;
  isAvailable: boolean;   // Si está disponible ese día
  timeBlocks?: TimeBlock[]; // Horario especial (si isAvailable = true)
}

/**
 * Horario semanal completo de un profesional
 */
export interface WeeklySchedule {
  professionalId: string;
  branchId?: string;      // Opcional: horario específico por sucursal
  schedule: DaySchedule[];
  exceptions: ScheduleException[];
  timezone?: string;      // Zona horaria (ej: 'America/Mexico_City')
  effectiveFrom?: string; // Fecha desde la que aplica (YYYY-MM-DD)
  effectiveTo?: string;   // Fecha hasta la que aplica (YYYY-MM-DD)
}

/**
 * Configuración de horario para guardar en la BD
 * Se almacena como JSON en el campo scheduleConfig del modelo Professional
 */
export interface ScheduleConfig {
  version: string;        // Versión del schema (para migraciones futuras)
  defaultSchedule: DaySchedule[];
  exceptions: ScheduleException[];
  timezone: string;
  lastUpdated: string;    // ISO timestamp
  updatedBy?: string;     // ID del usuario que actualizó
}

/**
 * Slot de tiempo disponible
 * Usado para mostrar disponibilidad al agendar citas
 */
export interface AvailableSlot {
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  professionalId: string;
  branchId?: string;
}

/**
 * Parámetros para consultar disponibilidad
 */
export interface AvailabilityQuery {
  professionalId: string;
  branchId?: string;
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD
  serviceDuration?: number; // Duración del servicio en minutos
  slotInterval?: number;  // Intervalo entre slots (default: 30 min)
}

/**
 * Resultado de validación de horario
 */
export interface ScheduleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Estadísticas de horario
 */
export interface ScheduleStats {
  totalWorkingHours: number;    // Horas semanales
  workingDays: number;           // Días laborables
  averageHoursPerDay: number;
  totalExceptions: number;
  upcomingExceptions: number;
}

/**
 * Schema JSON para validación
 * Este es el formato que se guarda en la base de datos
 */
export const SCHEDULE_CONFIG_SCHEMA = {
  type: 'object',
  required: ['version', 'defaultSchedule', 'timezone', 'lastUpdated'],
  properties: {
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    defaultSchedule: {
      type: 'array',
      items: {
        type: 'object',
        required: ['day', 'isWorkingDay', 'timeBlocks'],
        properties: {
          day: { 
            type: 'string', 
            enum: Object.values(DayOfWeek) 
          },
          isWorkingDay: { type: 'boolean' },
          timeBlocks: {
            type: 'array',
            items: {
              type: 'object',
              required: ['startTime', 'endTime'],
              properties: {
                startTime: { 
                  type: 'string', 
                  pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' 
                },
                endTime: { 
                  type: 'string', 
                  pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' 
                }
              }
            }
          }
        }
      }
    },
    exceptions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['date', 'type', 'isAvailable'],
        properties: {
          id: { type: 'string' },
          date: { 
            type: 'string', 
            pattern: '^\\d{4}-\\d{2}-\\d{2}$' 
          },
          type: { 
            type: 'string', 
            enum: Object.values(ExceptionType) 
          },
          reason: { type: 'string' },
          isAvailable: { type: 'boolean' },
          timeBlocks: {
            type: 'array',
            items: {
              type: 'object',
              required: ['startTime', 'endTime'],
              properties: {
                startTime: { type: 'string' },
                endTime: { type: 'string' }
              }
            }
          }
        }
      }
    },
    timezone: { type: 'string' },
    lastUpdated: { type: 'string', format: 'date-time' },
    updatedBy: { type: 'string' }
  }
};

/**
 * Horario por defecto (Lunes a Viernes 9:00-18:00)
 */
export const DEFAULT_SCHEDULE: DaySchedule[] = [
  {
    day: DayOfWeek.MONDAY,
    isWorkingDay: true,
    timeBlocks: [{ startTime: '09:00', endTime: '18:00' }]
  },
  {
    day: DayOfWeek.TUESDAY,
    isWorkingDay: true,
    timeBlocks: [{ startTime: '09:00', endTime: '18:00' }]
  },
  {
    day: DayOfWeek.WEDNESDAY,
    isWorkingDay: true,
    timeBlocks: [{ startTime: '09:00', endTime: '18:00' }]
  },
  {
    day: DayOfWeek.THURSDAY,
    isWorkingDay: true,
    timeBlocks: [{ startTime: '09:00', endTime: '18:00' }]
  },
  {
    day: DayOfWeek.FRIDAY,
    isWorkingDay: true,
    timeBlocks: [{ startTime: '09:00', endTime: '18:00' }]
  },
  {
    day: DayOfWeek.SATURDAY,
    isWorkingDay: false,
    timeBlocks: []
  },
  {
    day: DayOfWeek.SUNDAY,
    isWorkingDay: false,
    timeBlocks: []
  }
];
