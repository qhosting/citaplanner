
/**
 * Tipos TypeScript para el Sistema de Reportes
 * Fase 3: Reportes por Profesional y Sucursal
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export enum ReportPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum ReportType {
  PROFESSIONAL = 'professional',
  BRANCH = 'branch',
  OVERVIEW = 'overview',
  COMPARISON = 'comparison'
}

// ============================================================================
// INTERFACES DE FILTROS
// ============================================================================

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ReportFilters {
  period: ReportPeriod;
  dateRange?: DateRange;
  professionalId?: string;
  branchId?: string;
  tenantId: string;
  includeInactive?: boolean;
}

// ============================================================================
// INTERFACES DE MÉTRICAS
// ============================================================================

export interface AppointmentMetrics {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  averageRevenue: number;
  projectedRevenue: number;
  revenueByStatus: {
    completed: number;
    pending: number;
    confirmed: number;
  };
}

export interface TimeMetrics {
  totalHours: number;
  averageAppointmentDuration: number;
  utilizationRate: number;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
}

export interface ClientMetrics {
  totalClients: number;
  newClients: number;
  returningClients: number;
  clientRetentionRate: number;
}

// ============================================================================
// INTERFACES DE REPORTES
// ============================================================================

export interface ProfessionalReport {
  professionalId: string;
  professionalName: string;
  period: ReportPeriod;
  dateRange: DateRange;
  appointments: AppointmentMetrics;
  revenue: RevenueMetrics;
  time: TimeMetrics;
  clients: ClientMetrics;
  branches: Array<{
    branchId: string;
    branchName: string;
    appointmentCount: number;
    revenue: number;
  }>;
  services: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  trends: {
    appointmentTrend: Array<{
      date: string;
      count: number;
    }>;
    revenueTrend: Array<{
      date: string;
      amount: number;
    }>;
  };
}

export interface BranchReport {
  branchId: string;
  branchName: string;
  period: ReportPeriod;
  dateRange: DateRange;
  appointments: AppointmentMetrics;
  revenue: RevenueMetrics;
  time: TimeMetrics;
  clients: ClientMetrics;
  professionals: Array<{
    professionalId: string;
    professionalName: string;
    appointmentCount: number;
    revenue: number;
    completionRate: number;
  }>;
  services: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  trends: {
    appointmentTrend: Array<{
      date: string;
      count: number;
    }>;
    revenueTrend: Array<{
      date: string;
      amount: number;
    }>;
  };
}

export interface OverviewReport {
  tenantId: string;
  period: ReportPeriod;
  dateRange: DateRange;
  appointments: AppointmentMetrics;
  revenue: RevenueMetrics;
  time: TimeMetrics;
  clients: ClientMetrics;
  topProfessionals: Array<{
    professionalId: string;
    professionalName: string;
    appointmentCount: number;
    revenue: number;
    rating: number;
  }>;
  topBranches: Array<{
    branchId: string;
    branchName: string;
    appointmentCount: number;
    revenue: number;
  }>;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  trends: {
    appointmentTrend: Array<{
      date: string;
      count: number;
    }>;
    revenueTrend: Array<{
      date: string;
      amount: number;
    }>;
  };
}

export interface ComparisonReport {
  period: ReportPeriod;
  dateRange: DateRange;
  type: 'professional' | 'branch';
  items: Array<{
    id: string;
    name: string;
    appointments: AppointmentMetrics;
    revenue: RevenueMetrics;
    clients: ClientMetrics;
  }>;
}

// ============================================================================
// INTERFACES DE RESPUESTA API
// ============================================================================

export interface ReportResponse<T> {
  success: boolean;
  data: T;
  generatedAt: Date;
  filters: ReportFilters;
}

export interface ReportError {
  success: false;
  error: string;
  code: string;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

export type ReportData = 
  | ProfessionalReport 
  | BranchReport 
  | OverviewReport 
  | ComparisonReport;

export type ReportMetrics = 
  | AppointmentMetrics 
  | RevenueMetrics 
  | TimeMetrics 
  | ClientMetrics;
