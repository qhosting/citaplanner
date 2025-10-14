
/**
 * Componente: Vista de Reporte de Sucursal
 * Muestra métricas detalladas de una sucursal específica
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Users, Clock, CheckCircle, User } from 'lucide-react';
import { BranchReport, ReportPeriod } from '@/lib/types/reports';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BranchReportViewProps {
  branchId: string;
  initialPeriod?: ReportPeriod;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function BranchReportView({ 
  branchId, 
  initialPeriod = ReportPeriod.MONTH 
}: BranchReportViewProps) {
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod);
  const [report, setReport] = useState<BranchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [branchId, period]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reports/branch/${branchId}?period=${period}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al cargar reporte');
      }

      setReport(data.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generando reporte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={loadReport} className="mt-4">Reintentar</Button>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return null;
  }

  // Preparar datos para gráfico de estado de citas
  const appointmentStatusData = [
    { name: 'Completadas', value: report.appointments.completed },
    { name: 'Pendientes', value: report.appointments.pending },
    { name: 'Confirmadas', value: report.appointments.confirmed },
    { name: 'Canceladas', value: report.appointments.cancelled },
    { name: 'No Show', value: report.appointments.noShow }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{report.branchName}</h2>
          <p className="text-muted-foreground">
            Reporte del {new Date(report.dateRange.startDate).toLocaleDateString('es-MX')} al{' '}
            {new Date(report.dateRange.endDate).toLocaleDateString('es-MX')}
          </p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ReportPeriod.DAY}>Hoy</SelectItem>
            <SelectItem value={ReportPeriod.WEEK}>Última Semana</SelectItem>
            <SelectItem value={ReportPeriod.MONTH}>Último Mes</SelectItem>
            <SelectItem value={ReportPeriod.YEAR}>Último Año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Totales</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.appointments.total}</div>
            <p className="text-xs text-muted-foreground">
              Tasa de completado: {formatPercentage(report.appointments.completionRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report.revenue.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {formatCurrency(report.revenue.averageRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.clients.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {report.clients.newClients} nuevos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabajadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.time.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Utilización: {formatPercentage(report.time.utilizationRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Citas</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horas Pico</CardTitle>
            <CardDescription>Horarios con más citas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.time.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                <YAxis />
                <Tooltip labelFormatter={(hour) => `${hour}:00`} />
                <Bar dataKey="count" fill="#8884d8" name="Citas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Citas</CardTitle>
            <CardDescription>Evolución en el período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.trends.appointmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Citas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
            <CardDescription>Evolución en el período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.trends.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#82ca9d" name="Ingresos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profesionales */}
      <Card>
        <CardHeader>
          <CardTitle>Desempeño por Profesional</CardTitle>
          <CardDescription>Citas, ingresos y tasa de completado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.professionals.map((professional) => (
              <div key={professional.professionalId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{professional.professionalName}</p>
                    <p className="text-sm text-muted-foreground">
                      {professional.appointmentCount} citas • {formatPercentage(professional.completionRate)} completado
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(professional.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios Más Solicitados</CardTitle>
          <CardDescription>Top servicios por cantidad e ingresos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={report.services}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="serviceName" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Cantidad" />
              <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
