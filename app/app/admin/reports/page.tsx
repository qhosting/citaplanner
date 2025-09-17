
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Users,
  DollarSign,
  Clock
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppointmentsChart } from '@/components/charts/appointments-chart'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { ServicesDonutChart } from '@/components/charts/services-donut-chart'
import { ProfessionalPerformanceChart } from '@/components/charts/professional-performance-chart'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

const mockMetrics = {
  appointments: {
    total: 287,
    completed: 241,
    cancelled: 28,
    noShow: 18,
    growth: 12.5
  },
  revenue: {
    total: 45280,
    services: 32450,
    products: 12830,
    growth: 8.3
  },
  clients: {
    total: 156,
    new: 23,
    returning: 133,
    retention: 85.3
  },
  professionals: {
    topEarner: 'Ana López',
    topEarnerAmount: 12450,
    avgCommission: 2180
  }
}

// Mock data for charts
const mockAppointmentsData = [
  { date: '2024-09-11', appointments: 25, completed: 22, cancelled: 3 },
  { date: '2024-09-12', appointments: 32, completed: 28, cancelled: 4 },
  { date: '2024-09-13', appointments: 28, completed: 25, cancelled: 3 },
  { date: '2024-09-14', appointments: 35, completed: 31, cancelled: 4 },
  { date: '2024-09-15', appointments: 30, completed: 27, cancelled: 3 },
  { date: '2024-09-16', appointments: 38, completed: 35, cancelled: 3 },
  { date: '2024-09-17', appointments: 42, completed: 38, cancelled: 4 }
]

const mockRevenueData = [
  { period: 'Lun', services: 2450, products: 680, total: 3130 },
  { period: 'Mar', services: 3200, products: 920, total: 4120 },
  { period: 'Mié', services: 2800, products: 750, total: 3550 },
  { period: 'Jue', services: 3800, products: 1200, total: 5000 },
  { period: 'Vie', services: 4200, products: 1450, total: 5650 },
  { period: 'Sáb', services: 5200, products: 1800, total: 7000 },
  { period: 'Dom', services: 1200, products: 380, total: 1580 }
]

const mockServicesData = [
  { service: 'Corte de Cabello', count: 45, revenue: 15750 },
  { service: 'Manicure', count: 38, revenue: 7600 },
  { service: 'Peinado', count: 25, revenue: 6250 },
  { service: 'Facial', count: 22, revenue: 9900 },
  { service: 'Masaje', count: 18, revenue: 10800 },
  { service: 'Depilación', count: 15, revenue: 4500 }
]

const mockProfessionalData = [
  { professional: 'Ana López', appointments: 85, revenue: 18500, rating: 4.9, completionRate: 96 },
  { professional: 'Juan Pérez', appointments: 72, revenue: 15200, rating: 4.7, completionRate: 94 },
  { professional: 'Laura García', appointments: 68, revenue: 14800, rating: 4.8, completionRate: 95 },
  { professional: 'Carlos Medina', appointments: 52, revenue: 11200, rating: 4.6, completionRate: 91 }
]

export default function ReportsPage() {
  const [period, setPeriod] = useState('month')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleExportReport = async (reportType: string) => {
    try {
      toast.success(`Generando reporte de ${reportType}...`)
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success(`Reporte de ${reportType} descargado exitosamente`)
    } catch (error) {
      toast.error('Error al generar el reporte')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tu negocio con datos detallados
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline"
            onClick={() => handleExportReport('general')}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Citas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.appointments.total}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{formatPercentage(mockMetrics.appointments.growth)} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockMetrics.revenue.total)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{formatPercentage(mockMetrics.revenue.growth)} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Atendidos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.clients.total}</div>
            <p className="text-xs text-muted-foreground">
              {mockMetrics.clients.new} nuevos clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Retención
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(mockMetrics.clients.retention)}</div>
            <p className="text-xs text-muted-foreground">
              Clientes que regresan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Interactivos */}
      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Citas</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Citas</CardTitle>
              <CardDescription>
                Análisis detallado de citas por día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentsChart data={mockAppointmentsData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ingresos</CardTitle>
              <CardDescription>
                Ingresos por servicios y productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={mockRevenueData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Servicios Más Populares</CardTitle>
              <CardDescription>
                Distribución de servicios por demanda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServicesDonutChart data={mockServicesData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento del Personal</CardTitle>
              <CardDescription>
                Análisis comparativo de profesionales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfessionalPerformanceChart data={mockProfessionalData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reportes Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Disponibles</CardTitle>
          <CardDescription>
            Descarga reportes detallados para análisis externos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => handleExportReport('ventas')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Reporte de Ventas</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => handleExportReport('clientes')}
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Reporte de Clientes</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => handleExportReport('citas')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Reporte de Citas</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => handleExportReport('horarios')}
            >
              <Clock className="h-6 w-6 mb-2" />
              <span className="text-sm">Reporte de Horarios</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => handleExportReport('comisiones')}
            >
              <DollarSign className="h-6 w-6 mb-2" />
              <span className="text-sm">Reporte de Comisiones</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => handleExportReport('tendencias')}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Reporte de Tendencias</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
