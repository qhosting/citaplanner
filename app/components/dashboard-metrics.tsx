
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, DollarSign, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface MetricsData {
  todayAppointments: number
  weeklyRevenue: number
  monthlyRevenue: number
  newClients: number
  completedAppointments: number
  pendingAppointments: number
  totalClients: number
  averageServicePrice: number
}

interface DashboardMetricsProps {
  tenantId: string
}

export function DashboardMetrics({ tenantId }: DashboardMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [tenantId])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Error cargando métricas</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const metricsCards = [
    {
      title: 'Citas Hoy',
      value: metrics.todayAppointments,
      icon: CalendarDays,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Agendadas para hoy'
    },
    {
      title: 'Ingresos Semanales',
      value: formatCurrency(metrics.weeklyRevenue),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Esta semana'
    },
    {
      title: 'Ingresos Mensuales',
      value: formatCurrency(metrics.monthlyRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Este mes'
    },
    {
      title: 'Nuevos Clientes',
      value: metrics.newClients,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Este mes'
    },
    {
      title: 'Citas Completadas',
      value: metrics.completedAppointments,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Este mes'
    },
    {
      title: 'Citas Pendientes',
      value: metrics.pendingAppointments,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Por confirmar'
    },
    {
      title: 'Total Clientes',
      value: metrics.totalClients,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Clientes activos'
    },
    {
      title: 'Precio Promedio',
      value: formatCurrency(metrics.averageServicePrice),
      icon: DollarSign,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'Por servicio'
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metricsCards.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
