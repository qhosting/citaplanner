/**
 * Calendar Types for CitaPlanner - Phase 4
 * 
 * Tipos TypeScript para el sistema de calendario por profesional
 * Incluye eventos, filtros, disponibilidad, y configuraciones de vista
 */

import { AppointmentStatus } from '@prisma/client';
import type { Event as BigCalendarEvent } from 'react-big-calendar';

// ==================== Calendar Event Types ====================

/**
 * Evento del calendario extendido con información de citas
 */
export interface CalendarEvent extends BigCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: CalendarEventResource;
  allDay?: boolean;
}

/**
 * Información adicional del evento (appointment data)
 */
export interface CalendarEventResource {
  appointmentId: string;
  professionalId: string;
  professionalName: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  branchId: string;
  branchName: string;
  status: AppointmentStatus;
  notes?: string;
  price?: number;
  duration?: number; // en minutos
}

// ==================== Availability Types ====================

/**
 * Bloque de disponibilidad del profesional
 */
export interface AvailabilityBlock {
  id: string;
  start: Date;
  end: Date;
  isAvailable: boolean;
  type: 'regular' | 'exception' | 'override';
  reason?: string; // para excepciones (vacaciones, baja médica)
  branchId?: string; // para overrides por sucursal
}

/**
 * Disponibilidad completa de un profesional en un rango de fechas
 */
export interface ProfessionalAvailability {
  professionalId: string;
  startDate: Date;
  endDate: Date;
  blocks: AvailabilityBlock[];
  exceptions: ScheduleExceptionInfo[];
}

/**
 * Información de excepción de horario
 */
export interface ScheduleExceptionInfo {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'OTHER';
  isRecurring: boolean;
}

// ==================== Filter Types ====================

/**
 * Filtros para el calendario
 */
export interface CalendarFilters {
  professionalId?: string;
  branchId?: string;
  status?: AppointmentStatus | 'ALL';
  serviceId?: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Opciones de filtro para UI
 */
export interface FilterOptions {
  branches: FilterOption[];
  services: FilterOption[];
  statuses: FilterOption[];
  professionals?: FilterOption[]; // solo para admin/gerente
}

export interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

// ==================== View Types ====================

/**
 * Tipos de vista del calendario
 */
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

/**
 * Configuración de vista del calendario
 */
export interface CalendarViewConfig {
  defaultView: CalendarView;
  availableViews: CalendarView[];
  showWeekends: boolean;
  step: number; // minutos por slot
  timeslots: number; // slots por hora
  min: Date; // hora mínima
  max: Date; // hora máxima
}

// ==================== API Request/Response Types ====================

/**
 * Request para obtener eventos del calendario
 */
export interface GetCalendarEventsRequest {
  professionalId: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  branchId?: string;
  status?: AppointmentStatus;
  serviceId?: string;
}

/**
 * Response de eventos del calendario
 */
export interface GetCalendarEventsResponse {
  success: boolean;
  events: CalendarEvent[];
  availability: ProfessionalAvailability;
  message?: string;
}

/**
 * Request para crear cita desde el calendario
 */
export interface CreateAppointmentFromCalendarRequest {
  professionalId: string;
  clientId: string;
  serviceId: string;
  branchId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  notes?: string;
}

/**
 * Request para reprogramar cita (drag & drop)
 */
export interface RescheduleAppointmentRequest {
  appointmentId: string;
  newStartTime: string; // ISO string
  newEndTime: string; // ISO string
  reason?: string;
}

/**
 * Response genérica de operaciones de calendario
 */
export interface CalendarOperationResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// ==================== Permission Types ====================

/**
 * Permisos de calendario por rol
 */
export interface CalendarPermissions {
  canViewOwnCalendar: boolean;
  canViewOthersCalendar: boolean;
  canCreateAppointment: boolean;
  canEditAppointment: boolean;
  canCancelAppointment: boolean;
  canRescheduleAppointment: boolean;
  canViewAllProfessionals: boolean;
}

// ==================== Drag & Drop Types ====================

/**
 * Evento movido (drag & drop)
 */
export interface MovedEvent {
  event: CalendarEvent;
  start: Date;
  end: Date;
  isAllDay?: boolean;
}

/**
 * Evento redimensionado
 */
export interface ResizedEvent {
  event: CalendarEvent;
  start: Date;
  end: Date;
}

// ==================== Validation Types ====================

/**
 * Resultado de validación de disponibilidad
 */
export interface AvailabilityValidation {
  isValid: boolean;
  reason?: string;
  conflictingAppointments?: string[];
  availabilityIssues?: string[];
}

/**
 * Opciones para validar disponibilidad
 */
export interface ValidateAvailabilityOptions {
  professionalId: string;
  startTime: Date;
  endTime: Date;
  branchId?: string;
  excludeAppointmentId?: string; // para edición
}

// ==================== Statistics Types ====================

/**
 * Estadísticas del calendario
 */
export interface CalendarStatistics {
  professionalId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalAppointments: number;
  appointmentsByStatus: {
    PENDING: number;
    CONFIRMED: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CANCELLED: number;
    NO_SHOW: number;
  };
  utilizationRate: number; // % de tiempo disponible ocupado
  averageAppointmentDuration: number; // minutos
  peakHours: Array<{ hour: number; count: number }>;
  peakDays: Array<{ day: string; count: number }>;
}

// ==================== Export all ====================

export type {
  BigCalendarEvent,
};

/**
 * Helper: Crear evento de calendario desde appointment
 */
export function createCalendarEventFromAppointment(
  appointment: any
): CalendarEvent {
  return {
    id: appointment.id,
    title: `${appointment.client.firstName} ${appointment.client.lastName} - ${appointment.service.name}`,
    start: new Date(appointment.startTime),
    end: new Date(appointment.endTime),
    resource: {
      appointmentId: appointment.id,
      professionalId: appointment.professionalId,
      professionalName: `${appointment.professional.user.firstName} ${appointment.professional.user.lastName}`,
      clientId: appointment.clientId,
      clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
      serviceId: appointment.serviceId,
      serviceName: appointment.service.name,
      branchId: appointment.branchId,
      branchName: appointment.branch.name,
      status: appointment.status,
      notes: appointment.notes,
      price: appointment.service.price,
      duration: appointment.service.duration,
    },
  };
}

/**
 * Helper: Obtener color según estado de cita
 */
export function getStatusColor(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    PENDING: '#3B82F6', // blue-500
    CONFIRMED: '#10B981', // green-500
    IN_PROGRESS: '#F59E0B', // amber-500
    COMPLETED: '#059669', // emerald-600
    CANCELLED: '#EF4444', // red-500
    NO_SHOW: '#6B7280', // gray-500
  };
  return colors[status] || '#6B7280';
}

/**
 * Helper: Validar si una fecha está en horario laboral
 */
export function isWithinWorkingHours(
  date: Date,
  workingHours: { start: string; end: string }
): boolean {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  
  const [startHour, startMinute] = workingHours.start.split(':').map(Number);
  const startInMinutes = startHour * 60 + startMinute;
  
  const [endHour, endMinute] = workingHours.end.split(':').map(Number);
  const endInMinutes = endHour * 60 + endMinute;
  
  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
}

/**
 * Helper: Obtener rango de fechas para una vista
 */
export function getDateRangeForView(
  date: Date,
  view: CalendarView
): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (view) {
    case 'day':
      end.setDate(end.getDate() + 1);
      break;
    case 'week':
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 7);
      break;
    case 'month':
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      break;
    case 'agenda':
      end.setMonth(end.getMonth() + 1);
      break;
  }
  
  return { start, end };
}
