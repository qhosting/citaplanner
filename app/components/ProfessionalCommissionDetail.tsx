/**
 * Componente: Detalle de Comisiones por Profesional
 * Vista detallada con histórico, gráficos y resumen
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Mail, Phone } from 'lucide-react';
import { CommissionSummary } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProfessionalCommissionDetailProps {
  professionalId: string;
}

export default function ProfessionalCommissionDetail({ professionalId }: ProfessionalCommissionDetailProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, [professionalId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/commissions/professional/${professionalId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al cargar resumen');
      }

      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading commission summary:', err);
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

  const getChartData = () => {
    if (!summary) return [];
    
    return summary.byPeriod.map(commission => ({
      period: commission.period,
      ventas: commission.totalSales,
      comisiones: commission.totalCommissions
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando resumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>❌ Error: {error}</p>
            <Button onClick={loadSummary} className="mt-4">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const professional = summary.byPeriod[0]?.professional;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Información del profesional */}
      {professional && (
        <Card>
          <CardHeader>
            <CardTitle>
              {professional.firstName} {professional.lastName}
            </CardTitle>
            <CardDescription>Información del profesional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{professional.email}</span>
              </div>
              {professional.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{professional.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por pagar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ya pagado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              Generadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Comisiones</CardTitle>
          <CardDescription>Ventas y comisiones por período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar dataKey="ventas" fill="#3b82f6" name="Ventas" />
                <Bar dataKey="comisiones" fill="#10b981" name="Comisiones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Histórico detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Comisiones</CardTitle>
          <CardDescription>Detalle por período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Período</th>
                  <th className="text-right py-3 px-4">Ventas</th>
                  <th className="text-right py-3 px-4">Comisión</th>
                  <th className="text-center py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Fecha de Pago</th>
                  <th className="text-left py-3 px-4">Notas</th>
                </tr>
              </thead>
              <tbody>
                {summary.byPeriod.map((commission) => (
                  <tr key={commission.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{commission.period}</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(commission.totalSales)}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      {formatCurrency(commission.totalCommissions)}
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant={commission.status === 'PAID' ? 'default' : 'outline'}>
                        {commission.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {commission.paidDate ? (
                        <span className="text-sm">
                          {format(new Date(commission.paidDate), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {commission.notes ? (
                        <span className="text-sm">{commission.notes}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
