
/**
 * Componente: Dashboard de Reportes
 * Vista general con métricas clave y gráficos
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, Users, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OverviewReport, ReportPeriod } from '@/lib/types/reports';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportDashboardProps {
  initialPeriod?: ReportPeriod;
}

export default function ReportDashboard({ initialPeriod = ReportPeriod.MONTH }: ReportDashboardProps) {
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [report, setReport] = useState<OverviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [period, dateRange]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/reports/overview?period=${period}`;
      
      if (period === ReportPeriod.CUSTOM && dateRange?.from && dateRange?.to) {
        url += `&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
      }

      const response = await fetch(url);
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

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>Selecciona el período para visualizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReportPeriod.DAY}>Hoy</SelectItem>
                <SelectItem value={ReportPeriod.WEEK}>Última Semana</SelectItem>
                <SelectItem value={ReportPeriod.MONTH}>Último Mes</SelectItem>
                <SelectItem value={ReportPeriod.YEAR}>Último Año</SelectItem>
                <SelectItem value={ReportPeriod.CUSTOM}>Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {period === ReportPeriod.CUSTOM && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'dd/MM/yyyy', { locale: es })} -{' '}
                          {format(dateRange.to, 'dd/MM/yyyy', { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, 'dd/MM/yyyy', { locale: es })
                      )
                    ) : (
                      <span>Seleccionar rango</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange as any}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            )}

            <Button onClick={loadReport} variant="secondary">
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

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
              {report.appointments.completed} completadas ({formatPercentage(report.appointments.completionRate)})
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

      {/* Gráficos de Tendencias */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Citas</CardTitle>
            <CardDescription>Número de citas por período</CardDescription>
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
            <CardDescription>Ingresos por período</CardDescription>
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

      {/* Top Profesionales */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Profesionales</CardTitle>
          <CardDescription>Por ingresos generados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={report.topProfessionals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="professionalName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Sucursales */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Sucursales</CardTitle>
          <CardDescription>Por ingresos generados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={report.topBranches}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branchName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Servicios</CardTitle>
          <CardDescription>Más solicitados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.topServices.map((service, index) => (
              <div key={service.serviceId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{service.serviceName}</p>
                    <p className="text-sm text-muted-foreground">{service.count} servicios</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(service.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
