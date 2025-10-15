/**
 * Dashboard Main Page
 * 
 * Página principal del dashboard con métricas, accesos rápidos y visualizaciones
 * Sprint 1 - Fase 6: Integración con métricas reales
 * 
 * Integrado con endpoint /api/dashboard/metrics para mostrar datos reales
 */

'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, TrendingUp, Users, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import DashboardMetricsCards from '@/app/components/dashboard/DashboardMetricsCards';
import DashboardQuickActions from '@/app/components/dashboard/DashboardQuickActions';
import DashboardCharts from '@/app/components/dashboard/DashboardCharts';
import BranchFilter from '@/app/components/dashboard/BranchFilter';
import { useDashboardMetrics } from '@/app/hooks/useDashboardMetrics';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Estado para filtro de sucursal
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Hook para obtener métricas del dashboard
  const { metrics, meta, loading, error, refetch } = useDashboardMetrics({
    branchId: selectedBranchId,
    autoFetch: true,
  });

  // Verificar autenticación
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // Obtener información del usuario y tenant
  const userName = session?.user?.firstName || 'Usuario';
  const tenantName = session?.user?.tenant?.name || 'Mi Empresa';
  const branchName = session?.user?.branch?.name || 'Principal';
  const userRole = session?.user?.role?.replace('_', ' ') || 'Usuario';

  // Obtener hora del día para saludo personalizado
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Formatear fecha de última actualización
  const formatLastUpdate = () => {
    if (!meta?.generatedAt) return '';
    const date = new Date(meta.generatedAt);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {userName} 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido al panel de control de <span className="font-semibold">{tenantName}</span>
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Rol: <span className="font-medium">{userRole}</span>
                </span>
                <span className="flex items-center gap-1">
                  📍 Sucursal: <span className="font-medium">{branchName}</span>
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Filtro de sucursal */}
              <BranchFilter
                selectedBranchId={selectedBranchId}
                onBranchChange={setSelectedBranchId}
              />

              {/* Fecha actual */}
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-600 font-medium">Hoy</div>
                <div className="text-sm font-bold text-blue-900">
                  {new Date().toLocaleDateString('es-MX', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </div>
              </div>

              {/* Botón de refetch */}
              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Indicador de última actualización */}
          {meta && (
            <div className="mt-3 text-xs text-gray-500">
              Última actualización: {formatLastUpdate()}
            </div>
          )}
        </div>

        {/* Estado de error */}
        {error && (
          <div className="mb-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800">
                    Error al cargar métricas
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                  <Button
                    onClick={refetch}
                    variant="outline"
                    size="sm"
                    className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skeleton loader mientras carga */}
        {loading && !metrics && (
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Métricas Principales */}
        {!loading && metrics && (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Métricas del Negocio
                </h2>
              </div>
              <DashboardMetricsCards metrics={metrics} />
            </div>

            {/* Accesos Rápidos */}
            <div className="mb-8">
              <DashboardQuickActions />
            </div>

            {/* Gráficos y Visualizaciones */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Visualizaciones
                </h2>
              </div>
              <DashboardCharts />
            </div>
          </>
        )}

        {/* Footer Info */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            CitaPlanner v1.8.9 - Sistema de Gestión de Citas y Servicios
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2024 CitaPlanner. Todos los derechos reservados.
          </p>
        </div>

        {/* Nota de éxito */}
        {!loading && metrics && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>✅ Integración completada:</strong> El dashboard ahora muestra datos reales del sistema 
              a través del endpoint <code className="px-1 py-0.5 bg-green-100 rounded">/api/dashboard/metrics</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
