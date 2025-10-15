/**
 * Dashboard Main Page
 * 
 * Página principal del dashboard con métricas, accesos rápidos y visualizaciones
 * Sprint 1 - Fase 1: Quick Fixes
 * 
 * IMPORTANTE: Esta página usa datos mock temporales.
 * En Fase 5 se integrará con el endpoint /api/dashboard/metrics
 */

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, TrendingUp, Users, Calendar } from 'lucide-react';
import DashboardMetricsCards from '@/app/components/dashboard/DashboardMetricsCards';
import DashboardQuickActions from '@/app/components/dashboard/DashboardQuickActions';
import DashboardCharts from '@/app/components/dashboard/DashboardCharts';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Métricas del Negocio
            </h2>
          </div>
          <DashboardMetricsCards />
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

        {/* Footer Info */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            CitaPlanner v1.8.3 - Sistema de Gestión de Citas y Servicios
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2024 CitaPlanner. Todos los derechos reservados.
          </p>
        </div>

        {/* Nota de desarrollo */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Nota de Desarrollo:</strong> Esta página utiliza datos mock temporales para demostración. 
            En la Fase 5 del Sprint 1 se integrará con el endpoint <code className="px-1 py-0.5 bg-yellow-100 rounded">/api/dashboard/metrics</code> para mostrar datos reales del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
