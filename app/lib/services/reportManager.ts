
/**
 * Report Manager Service
 * Fase 3: Sistema de Reportes por Profesional y Sucursal
 * 
 * Genera reportes completos con métricas, estadísticas y tendencias
 */

import { prisma } from '@/lib/prisma';
import {
  ReportFilters,
  ReportPeriod,
  DateRange,
  ProfessionalReport,
  BranchReport,
  OverviewReport,
  ComparisonReport,
  AppointmentMetrics,
  RevenueMetrics,
  TimeMetrics,
  ClientMetrics,
  AppointmentStatus
} from '@/lib/types/reports';

export class ReportManager {
  /**
   * Calcula el rango de fechas basado en el período
   */
  static calculateDateRange(period: ReportPeriod, customRange?: DateRange): DateRange {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case ReportPeriod.DAY:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;

      case ReportPeriod.WEEK:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;

      case ReportPeriod.MONTH:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case ReportPeriod.YEAR:
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case ReportPeriod.CUSTOM:
        if (!customRange) {
          throw new Error('Custom range required for CUSTOM period');
        }
        startDate = customRange.startDate;
        endDate = customRange.endDate;
        break;

      default:
        throw new Error(`Invalid period: ${period}`);
    }

    return { startDate, endDate };
  }

  /**
   * Calcula métricas de citas
   */
  static async calculateAppointmentMetrics(
    appointments: any[]
  ): Promise<AppointmentMetrics> {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const noShow = appointments.filter(a => a.status === 'no_show').length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;
    const noShowRate = total > 0 ? (noShow / total) * 100 : 0;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      noShow,
      completionRate: Math.round(completionRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      noShowRate: Math.round(noShowRate * 100) / 100
    };
  }

  /**
   * Calcula métricas de ingresos
   */
  static async calculateRevenueMetrics(
    appointments: any[]
  ): Promise<RevenueMetrics> {
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');

    const completedRevenue = completedAppointments.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
    const pendingRevenue = pendingAppointments.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
    const confirmedRevenue = confirmedAppointments.reduce((sum, a) => sum + (a.totalPrice || 0), 0);

    const totalRevenue = completedRevenue;
    const projectedRevenue = totalRevenue + pendingRevenue + confirmedRevenue;
    const averageRevenue = completedAppointments.length > 0 
      ? totalRevenue / completedAppointments.length 
      : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRevenue: Math.round(averageRevenue * 100) / 100,
      projectedRevenue: Math.round(projectedRevenue * 100) / 100,
      revenueByStatus: {
        completed: Math.round(completedRevenue * 100) / 100,
        pending: Math.round(pendingRevenue * 100) / 100,
        confirmed: Math.round(confirmedRevenue * 100) / 100
      }
    };
  }

  /**
   * Calcula métricas de tiempo
   */
  static async calculateTimeMetrics(
    appointments: any[]
  ): Promise<TimeMetrics> {
    const totalMinutes = appointments.reduce((sum, a) => sum + (a.duration || 0), 0);
    const totalHours = totalMinutes / 60;
    const averageAppointmentDuration = appointments.length > 0 
      ? totalMinutes / appointments.length 
      : 0;

    // Calcular horas pico
    const hourCounts: { [key: number]: number } = {};
    appointments.forEach(a => {
      const hour = new Date(a.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calcular tasa de utilización (simplificado)
    const workingHoursPerDay = 8;
    const dateRange = this.getDateRangeInDays(appointments);
    const totalAvailableHours = dateRange * workingHoursPerDay;
    const utilizationRate = totalAvailableHours > 0 
      ? (totalHours / totalAvailableHours) * 100 
      : 0;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      averageAppointmentDuration: Math.round(averageAppointmentDuration),
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      peakHours
    };
  }

  /**
   * Calcula métricas de clientes
   */
  static async calculateClientMetrics(
    appointments: any[],
    tenantId: string,
    dateRange: DateRange
  ): Promise<ClientMetrics> {
    const uniqueClientIds = [...new Set(appointments.map(a => a.clientId))];
    const totalClients = uniqueClientIds.length;

    // Obtener clientes nuevos (creados en el período)
    const newClientsCount = await prisma.client.count({
      where: {
        tenantId,
        id: { in: uniqueClientIds },
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      }
    });

    const returningClients = totalClients - newClientsCount;
    const clientRetentionRate = totalClients > 0 
      ? (returningClients / totalClients) * 100 
      : 0;

    return {
      totalClients,
      newClients: newClientsCount,
      returningClients,
      clientRetentionRate: Math.round(clientRetentionRate * 100) / 100
    };
  }

  /**
   * Calcula tendencias de citas
   */
  static calculateAppointmentTrend(
    appointments: any[],
    period: ReportPeriod
  ): Array<{ date: string; count: number }> {
    const groupedByDate: { [key: string]: number } = {};

    appointments.forEach(a => {
      const date = new Date(a.startTime);
      let key: string;

      switch (period) {
        case ReportPeriod.DAY:
          key = date.toISOString().split('T')[0];
          break;
        case ReportPeriod.WEEK:
        case ReportPeriod.MONTH:
          key = date.toISOString().split('T')[0];
          break;
        case ReportPeriod.YEAR:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      groupedByDate[key] = (groupedByDate[key] || 0) + 1;
    });

    return Object.entries(groupedByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calcula tendencias de ingresos
   */
  static calculateRevenueTrend(
    appointments: any[],
    period: ReportPeriod
  ): Array<{ date: string; amount: number }> {
    const groupedByDate: { [key: string]: number } = {};

    appointments
      .filter(a => a.status === 'completed')
      .forEach(a => {
        const date = new Date(a.startTime);
        let key: string;

        switch (period) {
          case ReportPeriod.DAY:
            key = date.toISOString().split('T')[0];
            break;
          case ReportPeriod.WEEK:
          case ReportPeriod.MONTH:
            key = date.toISOString().split('T')[0];
            break;
          case ReportPeriod.YEAR:
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }

        groupedByDate[key] = (groupedByDate[key] || 0) + (a.totalPrice || 0);
      });

    return Object.entries(groupedByDate)
      .map(([date, amount]) => ({ 
        date, 
        amount: Math.round(amount * 100) / 100 
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Genera reporte de profesional
   */
  static async generateProfessionalReport(
    filters: ReportFilters
  ): Promise<ProfessionalReport> {
    if (!filters.professionalId) {
      throw new Error('Professional ID is required');
    }

    const dateRange = filters.dateRange || this.calculateDateRange(filters.period);

    // Obtener profesional
    const professional = await prisma.professional.findUnique({
      where: { 
        id: filters.professionalId,
        tenantId: filters.tenantId
      },
      include: {
        user: true
      }
    });

    if (!professional) {
      throw new Error('Professional not found');
    }

    // Obtener citas del período
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: filters.professionalId,
        tenantId: filters.tenantId,
        startTime: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      include: {
        service: true,
        branch: true,
        client: true
      }
    });

    // Calcular métricas
    const appointmentMetrics = await this.calculateAppointmentMetrics(appointments);
    const revenueMetrics = await this.calculateRevenueMetrics(appointments);
    const timeMetrics = await this.calculateTimeMetrics(appointments);
    const clientMetrics = await this.calculateClientMetrics(
      appointments, 
      filters.tenantId, 
      dateRange
    );

    // Agrupar por sucursal
    const branchGroups: { [key: string]: any[] } = {};
    appointments.forEach(a => {
      if (a.branchId) {
        if (!branchGroups[a.branchId]) {
          branchGroups[a.branchId] = [];
        }
        branchGroups[a.branchId].push(a);
      }
    });

    const branches = Object.entries(branchGroups).map(([branchId, branchAppts]) => ({
      branchId,
      branchName: branchAppts[0]?.branch?.name || 'Unknown',
      appointmentCount: branchAppts.length,
      revenue: branchAppts
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0)
    }));

    // Agrupar por servicio
    const serviceGroups: { [key: string]: any[] } = {};
    appointments.forEach(a => {
      if (a.serviceId) {
        if (!serviceGroups[a.serviceId]) {
          serviceGroups[a.serviceId] = [];
        }
        serviceGroups[a.serviceId].push(a);
      }
    });

    const services = Object.entries(serviceGroups).map(([serviceId, serviceAppts]) => ({
      serviceId,
      serviceName: serviceAppts[0]?.service?.name || 'Unknown',
      count: serviceAppts.length,
      revenue: serviceAppts
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0)
    }));

    // Calcular tendencias
    const appointmentTrend = this.calculateAppointmentTrend(appointments, filters.period);
    const revenueTrend = this.calculateRevenueTrend(appointments, filters.period);

    return {
      professionalId: professional.id,
      professionalName: professional.user.name,
      period: filters.period,
      dateRange,
      appointments: appointmentMetrics,
      revenue: revenueMetrics,
      time: timeMetrics,
      clients: clientMetrics,
      branches,
      services,
      trends: {
        appointmentTrend,
        revenueTrend
      }
    };
  }

  /**
   * Genera reporte de sucursal
   */
  static async generateBranchReport(
    filters: ReportFilters
  ): Promise<BranchReport> {
    if (!filters.branchId) {
      throw new Error('Branch ID is required');
    }

    const dateRange = filters.dateRange || this.calculateDateRange(filters.period);

    // Obtener sucursal
    const branch = await prisma.branch.findUnique({
      where: { 
        id: filters.branchId,
        tenantId: filters.tenantId
      }
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    // Obtener citas del período
    const appointments = await prisma.appointment.findMany({
      where: {
        branchId: filters.branchId,
        tenantId: filters.tenantId,
        startTime: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      include: {
        service: true,
        professional: {
          include: {
            user: true
          }
        },
        client: true
      }
    });

    // Calcular métricas
    const appointmentMetrics = await this.calculateAppointmentMetrics(appointments);
    const revenueMetrics = await this.calculateRevenueMetrics(appointments);
    const timeMetrics = await this.calculateTimeMetrics(appointments);
    const clientMetrics = await this.calculateClientMetrics(
      appointments, 
      filters.tenantId, 
      dateRange
    );

    // Agrupar por profesional
    const professionalGroups: { [key: string]: any[] } = {};
    appointments.forEach(a => {
      if (a.professionalId) {
        if (!professionalGroups[a.professionalId]) {
          professionalGroups[a.professionalId] = [];
        }
        professionalGroups[a.professionalId].push(a);
      }
    });

    const professionals = Object.entries(professionalGroups).map(([professionalId, profAppts]) => {
      const completed = profAppts.filter(a => a.status === 'completed').length;
      const total = profAppts.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        professionalId,
        professionalName: profAppts[0]?.professional?.user?.name || 'Unknown',
        appointmentCount: total,
        revenue: profAppts
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.totalPrice || 0), 0),
        completionRate: Math.round(completionRate * 100) / 100
      };
    });

    // Agrupar por servicio
    const serviceGroups: { [key: string]: any[] } = {};
    appointments.forEach(a => {
      if (a.serviceId) {
        if (!serviceGroups[a.serviceId]) {
          serviceGroups[a.serviceId] = [];
        }
        serviceGroups[a.serviceId].push(a);
      }
    });

    const services = Object.entries(serviceGroups).map(([serviceId, serviceAppts]) => ({
      serviceId,
      serviceName: serviceAppts[0]?.service?.name || 'Unknown',
      count: serviceAppts.length,
      revenue: serviceAppts
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0)
    }));

    // Calcular tendencias
    const appointmentTrend = this.calculateAppointmentTrend(appointments, filters.period);
    const revenueTrend = this.calculateRevenueTrend(appointments, filters.period);

    return {
      branchId: branch.id,
      branchName: branch.name,
      period: filters.period,
      dateRange,
      appointments: appointmentMetrics,
      revenue: revenueMetrics,
      time: timeMetrics,
      clients: clientMetrics,
      professionals,
      services,
      trends: {
        appointmentTrend,
        revenueTrend
      }
    };
  }

  /**
   * Genera reporte general (overview)
   */
  static async generateOverviewReport(
    filters: ReportFilters
  ): Promise<OverviewReport> {
    const dateRange = filters.dateRange || this.calculateDateRange(filters.period);

    // Obtener todas las citas del período
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: filters.tenantId,
        startTime: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      include: {
        service: true,
        professional: {
          include: {
            user: true
          }
        },
        branch: true,
        client: true
      }
    });

    // Calcular métricas generales
    const appointmentMetrics = await this.calculateAppointmentMetrics(appointments);
    const revenueMetrics = await this.calculateRevenueMetrics(appointments);
    const timeMetrics = await this.calculateTimeMetrics(appointments);
    const clientMetrics = await this.calculateClientMetrics(
      appointments, 
      filters.tenantId, 
      dateRange
    );

    // Top profesionales
    const professionalGroups: { [key: string]: any[] } = {};
    appointments.forEach(a => {
      if (a.professionalId) {
        if (!professionalGroups[a.professionalId]) {
          professionalGroups[a.professionalId] = [];
        }
        professionalGroups[a.professionalId].push(a);
      }
    });

    const topProfessionals = Object.entries(professionalGroups)
      .map(([professionalId, profAppts]) => ({
        professionalId,
        professionalName: profAppts[0]?.professional?.user?.name || 'Unknown',
        appointmentCount: profAppts.length,
        revenue: profAppts
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.totalPrice || 0), 0),
        rating: 0 // TODO: Implementar sistema de ratings
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top sucursales
    const branchGroups: { [key: string]: any[] } = {};
    appointments.forEach(a => {
      if (a.branchId) {
        if (!branchGroups[a.branchId]) {
          branchGroups[a.branchId] = [];
        }
        branchGroups[a.branchId].push(a);
      }
    });

    const topBranches = Object.entries(branchGroups)
      .map(([branchId, branchAppts]) => ({
        branchId,
        branchName: branchAppts[0]?.branch?.name || 'Unknown',
        appointmentCount: branchAppts.length,
        revenue: branchAppts
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.totalPrice || 0), 0)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top servicios
    const serviceGroups: { [key: string]: any[] } = {};
    appointments.forEach(a => {
      if (a.serviceId) {
        if (!serviceGroups[a.serviceId]) {
          serviceGroups[a.serviceId] = [];
        }
        serviceGroups[a.serviceId].push(a);
      }
    });

    const topServices = Object.entries(serviceGroups)
      .map(([serviceId, serviceAppts]) => ({
        serviceId,
        serviceName: serviceAppts[0]?.service?.name || 'Unknown',
        count: serviceAppts.length,
        revenue: serviceAppts
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.totalPrice || 0), 0)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calcular tendencias
    const appointmentTrend = this.calculateAppointmentTrend(appointments, filters.period);
    const revenueTrend = this.calculateRevenueTrend(appointments, filters.period);

    return {
      tenantId: filters.tenantId,
      period: filters.period,
      dateRange,
      appointments: appointmentMetrics,
      revenue: revenueMetrics,
      time: timeMetrics,
      clients: clientMetrics,
      topProfessionals,
      topBranches,
      topServices,
      trends: {
        appointmentTrend,
        revenueTrend
      }
    };
  }

  /**
   * Genera reporte comparativo
   */
  static async generateComparisonReport(
    filters: ReportFilters,
    type: 'professional' | 'branch',
    ids: string[]
  ): Promise<ComparisonReport> {
    const dateRange = filters.dateRange || this.calculateDateRange(filters.period);

    const items = await Promise.all(
      ids.map(async (id) => {
        const itemFilters = {
          ...filters,
          dateRange,
          [type === 'professional' ? 'professionalId' : 'branchId']: id
        };

        const appointments = await prisma.appointment.findMany({
          where: {
            tenantId: filters.tenantId,
            [type === 'professional' ? 'professionalId' : 'branchId']: id,
            startTime: {
              gte: dateRange.startDate,
              lte: dateRange.endDate
            }
          },
          include: {
            service: true,
            professional: {
              include: {
                user: true
              }
            },
            branch: true,
            client: true
          }
        });

        const appointmentMetrics = await this.calculateAppointmentMetrics(appointments);
        const revenueMetrics = await this.calculateRevenueMetrics(appointments);
        const clientMetrics = await this.calculateClientMetrics(
          appointments,
          filters.tenantId,
          dateRange
        );

        let name = 'Unknown';
        if (type === 'professional' && appointments.length > 0) {
          name = appointments[0]?.professional?.user?.name || 'Unknown';
        } else if (type === 'branch' && appointments.length > 0) {
          name = appointments[0]?.branch?.name || 'Unknown';
        }

        return {
          id,
          name,
          appointments: appointmentMetrics,
          revenue: revenueMetrics,
          clients: clientMetrics
        };
      })
    );

    return {
      period: filters.period,
      dateRange,
      type,
      items
    };
  }

  /**
   * Utilidad: Obtener rango de días
   */
  private static getDateRangeInDays(appointments: any[]): number {
    if (appointments.length === 0) return 0;

    const dates = appointments.map(a => new Date(a.startTime).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const diffTime = Math.abs(maxDate - minDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays || 1;
  }
}
