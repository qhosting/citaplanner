/**
 * Dashboard Types
 * 
 * Interfaces TypeScript para métricas del dashboard
 * Sprint 1 - Fase 6: Integración con métricas reales
 */

/**
 * Métricas de citas
 */
export interface AppointmentMetrics {
  /** Total de citas en el periodo seleccionado */
  today: number;
  /** Citas completadas */
  completed: number;
  /** Citas pendientes o confirmadas */
  pending: number;
  /** Citas canceladas */
  cancelled: number;
}

/**
 * Métricas de ingresos
 */
export interface RevenueMetrics {
  /** Ingresos en el periodo seleccionado (hoy por defecto) */
  today: number;
  /** Ingresos de esta semana */
  weekly: number;
  /** Ingresos de este mes */
  monthly: number;
}

/**
 * Métricas de clientes
 */
export interface ClientMetrics {
  /** Nuevos clientes este mes */
  newThisMonth: number;
  /** Total de clientes activos */
  total: number;
}

/**
 * Métricas de profesionales
 */
export interface ProfessionalMetrics {
  /** Profesionales activos */
  active: number;
}

/**
 * Métricas calculadas del sistema
 */
export interface SystemMetrics {
  /** Precio promedio de servicios */
  averageServicePrice: number;
  /** Tasa de completado de citas (porcentaje) */
  completionRate: number;
}

/**
 * Datos completos de métricas del dashboard
 */
export interface DashboardMetrics {
  /** Métricas de citas */
  appointments: AppointmentMetrics;
  /** Métricas de ingresos */
  revenue: RevenueMetrics;
  /** Métricas de clientes */
  clients: ClientMetrics;
  /** Métricas de profesionales */
  professionals: ProfessionalMetrics;
  /** Métricas del sistema */
  metrics: SystemMetrics;
}

/**
 * Metadata de la respuesta
 */
export interface DashboardMetricsMeta {
  /** ID de sucursal (null si no se filtró) */
  branchId: string | null;
  /** Fecha de inicio del periodo */
  startDate: string;
  /** Fecha de fin del periodo */
  endDate: string;
  /** Timestamp de generación */
  generatedAt: string;
}

/**
 * Respuesta completa del endpoint /api/dashboard/metrics
 */
export interface DashboardMetricsResponse {
  /** Indica si la petición fue exitosa */
  success: boolean;
  /** Datos de métricas */
  data: DashboardMetrics;
  /** Metadata de la respuesta */
  meta: DashboardMetricsMeta;
  /** Mensaje de error (solo si success = false) */
  error?: string;
}

/**
 * Estado del hook useDashboardMetrics
 */
export interface UseDashboardMetricsState {
  /** Datos de métricas (null mientras carga) */
  metrics: DashboardMetrics | null;
  /** Metadata de la respuesta */
  meta: DashboardMetricsMeta | null;
  /** Indica si está cargando */
  loading: boolean;
  /** Error si ocurrió */
  error: string | null;
  /** Función para refrescar los datos */
  refetch: () => void;
}

/**
 * Opciones para el hook useDashboardMetrics
 */
export interface UseDashboardMetricsOptions {
  /** ID de sucursal para filtrar (opcional) */
  branchId?: string | null;
  /** Fecha de inicio del periodo (opcional, formato ISO) */
  startDate?: string | null;
  /** Fecha de fin del periodo (opcional, formato ISO) */
  endDate?: string | null;
  /** Si debe hacer fetch automático al montar (default: true) */
  autoFetch?: boolean;
}

/**
 * Información de sucursal para el filtro
 */
export interface BranchInfo {
  /** ID de la sucursal */
  id: string;
  /** Nombre de la sucursal */
  name: string;
  /** Indica si está activa */
  isActive: boolean;
}

/**
 * Respuesta del endpoint /api/branches para el filtro
 */
export interface BranchesResponse {
  /** Indica si la petición fue exitosa */
  success: boolean;
  /** Lista de sucursales */
  data: BranchInfo[];
  /** Mensaje de error (solo si success = false) */
  error?: string;
}
