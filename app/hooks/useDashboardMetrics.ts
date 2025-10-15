/**
 * useDashboardMetrics Hook
 * 
 * Hook personalizado para obtener y gestionar las métricas del dashboard
 * Sprint 1 - Fase 6: Integración con métricas reales
 * 
 * Características:
 * - Fetch automático al montar el componente (configurable)
 * - Manejo de estados: loading, success, error
 * - Función refetch para actualizar manualmente
 * - Soporte para filtros: branchId, startDate, endDate
 * - TypeScript types completos
 * - Manejo robusto de errores
 * 
 * @example
 * ```tsx
 * // Uso básico (fetch automático, datos del día actual)
 * const { metrics, loading, error, refetch } = useDashboardMetrics();
 * 
 * // Con filtro de sucursal
 * const { metrics, loading, error } = useDashboardMetrics({ branchId: 'abc123' });
 * 
 * // Con rango de fechas
 * const { metrics, loading, error } = useDashboardMetrics({ 
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * 
 * // Sin fetch automático (fetch manual con refetch)
 * const { metrics, loading, error, refetch } = useDashboardMetrics({ autoFetch: false });
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DashboardMetrics,
  DashboardMetricsMeta,
  DashboardMetricsResponse,
  UseDashboardMetricsState,
  UseDashboardMetricsOptions,
} from '@/app/types/dashboard';

/**
 * Hook para obtener métricas del dashboard
 * 
 * @param options - Opciones del hook (branchId, startDate, endDate, autoFetch)
 * @returns Estado del hook con metrics, loading, error, refetch
 */
export function useDashboardMetrics(
  options: UseDashboardMetricsOptions = {}
): UseDashboardMetricsState {
  const {
    branchId = null,
    startDate = null,
    endDate = null,
    autoFetch = true,
  } = options;

  // Estados
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [meta, setMeta] = useState<DashboardMetricsMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para hacer fetch de métricas
   */
  const fetchMetrics = useCallback(async () => {
    try {
      // Indicar que está cargando
      setLoading(true);
      setError(null);

      // Construir URL con query params
      const params = new URLSearchParams();

      if (branchId) {
        params.append('branchId', branchId);
      }

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (endDate) {
        params.append('endDate', endDate);
      }

      const url = `/api/dashboard/metrics${params.toString() ? `?${params.toString()}` : ''}`;

      // Hacer fetch
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Parsear respuesta
      const data: DashboardMetricsResponse = await response.json();

      // Verificar si la respuesta fue exitosa
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al obtener las métricas del dashboard');
      }

      // Actualizar estados con datos exitosos
      setMetrics(data.data);
      setMeta(data.meta);
      setError(null);
    } catch (err) {
      // Manejo de errores
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error desconocido al obtener métricas';
      
      setError(errorMessage);
      setMetrics(null);
      setMeta(null);

      console.error('Error fetching dashboard metrics:', err);
    } finally {
      // Siempre indicar que terminó de cargar
      setLoading(false);
    }
  }, [branchId, startDate, endDate]);

  /**
   * Función refetch para actualizar manualmente
   */
  const refetch = useCallback(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  /**
   * Effect para hacer fetch automático al montar o cuando cambien las dependencias
   */
  useEffect(() => {
    if (autoFetch) {
      fetchMetrics();
    }
  }, [autoFetch, fetchMetrics]);

  // Retornar estado del hook
  return {
    metrics,
    meta,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook auxiliar para obtener lista de sucursales (para el filtro)
 * 
 * @returns Estado con lista de sucursales, loading, error
 */
export function useBranches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/branches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al obtener sucursales');
      }

      setBranches(data.data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error desconocido al obtener sucursales';
      
      setError(errorMessage);
      setBranches([]);

      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return {
    branches,
    loading,
    error,
    refetch: fetchBranches,
  };
}
