/**
 * DashboardMetricsCards Component
 * 
 * Componente que muestra tarjetas de métricas del dashboard
 * Sprint 1 - Fase 6: Integración con métricas reales
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CalendarDays, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserCheck,
  Calendar,
  CreditCard
} from 'lucide-react';
import { DashboardMetrics } from '@/app/types/dashboard';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  color: string;
  bgColor: string;
  trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  color,
  bgColor,
  trend
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>
          {value}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
        {trend && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardMetricsCardsProps {
  /** Métricas del dashboard desde la API */
  metrics: DashboardMetrics;
}

export default function DashboardMetricsCards({ metrics }: DashboardMetricsCardsProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const metricsData: MetricCardProps[] = [
    {
      title: 'Citas Hoy',
      value: metrics.appointments.today,
      icon: CalendarDays,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Agendadas para hoy'
    },
    {
      title: 'Citas Completadas',
      value: metrics.appointments.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Finalizadas hoy'
    },
    {
      title: 'Citas Pendientes',
      value: metrics.appointments.pending,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Por confirmar'
    },
    {
      title: 'Ingresos Hoy',
      value: formatCurrency(metrics.revenue.today),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Facturado hoy'
    },
    {
      title: 'Ingresos Semanales',
      value: formatCurrency(metrics.revenue.weekly),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Esta semana'
    },
    {
      title: 'Ingresos Mensuales',
      value: formatCurrency(metrics.revenue.monthly),
      icon: DollarSign,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'Este mes'
    },
    {
      title: 'Nuevos Clientes',
      value: metrics.clients.newThisMonth,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Este mes'
    },
    {
      title: 'Total Clientes',
      value: metrics.clients.total,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Clientes activos'
    },
    {
      title: 'Profesionales Activos',
      value: metrics.professionals.active,
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'En servicio'
    },
    {
      title: 'Precio Promedio',
      value: formatCurrency(metrics.metrics.averageServicePrice),
      icon: CreditCard,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'Por servicio'
    },
    {
      title: 'Tasa de Completado',
      value: `${metrics.metrics.completionRate}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Citas completadas'
    },
    {
      title: 'Cancelaciones',
      value: metrics.appointments.cancelled,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Hoy'
    }
  ];

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {metricsData.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
