/**
 * Componente: Dashboard de Comisiones
 * Vista general con filtros, estadísticas y tabla de comisiones
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { Commission, CommissionStats } from '@/lib/types';
import { CommissionStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CommissionDashboard() {
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [filteredCommissions, setFilteredCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCommissions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [commissions, statusFilter, periodFilter, searchTerm]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/commissions');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al cargar comisiones');
      }

      setCommissions(data.commissions);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading commissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...commissions];

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filtro por período
    if (periodFilter !== 'all') {
      filtered = filtered.filter(c => c.period === periodFilter);
    }

    // Búsqueda por nombre de profesional
    if (searchTerm) {
      filtered = filtered.filter(c => {
        const fullName = `${c.professional?.firstName} ${c.professional?.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
    }

    setFilteredCommissions(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getStatusBadge = (status: CommissionStatus) => {
    const variants: Record<CommissionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pendiente', variant: 'outline' },
      PAID: { label: 'Pagado', variant: 'default' }
    };

    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPeriods = () => {
    const periods = new Set(commissions.map(c => c.period));
    return Array.from(periods).sort().reverse();
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const response = await fetch(`/api/commissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_as_paid' })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al actualizar comisión');
      }

      // Recargar comisiones
      loadCommissions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando comisiones...</p>
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
            <Button onClick={loadCommissions} className="mt-4">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalPending + stats.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total acumulado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes de Pago</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalPending)}
              </div>
              <p className="text-xs text-muted-foreground">
                Por pagar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">
                Ya pagadas
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
                {formatCurrency(stats.totalSales)}
              </div>
              <p className="text-xs text-muted-foreground">
                Ventas generadoras
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra las comisiones por estado, período o profesional</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PAID">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  {getPeriods().map(period => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Profesional</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre del profesional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de comisiones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comisiones</CardTitle>
              <CardDescription>
                {filteredCommissions.length} comision{filteredCommissions.length !== 1 ? 'es' : ''}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCommissions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron comisiones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Profesional</th>
                    <th className="text-left py-3 px-4">Período</th>
                    <th className="text-right py-3 px-4">Ventas</th>
                    <th className="text-right py-3 px-4">Comisión</th>
                    <th className="text-center py-3 px-4">Estado</th>
                    <th className="text-center py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissions.map((commission) => (
                    <tr key={commission.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">
                              {commission.professional?.firstName} {commission.professional?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {commission.professional?.email}
                            </p>
                          </div>
                        </div>
                      </td>
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
                        {getStatusBadge(commission.status)}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/commissions/${commission.professionalId}`)}
                          >
                            Ver Detalle
                          </Button>
                          {commission.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(commission.id)}
                            >
                              Marcar Pagado
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
