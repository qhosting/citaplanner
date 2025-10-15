/**
 * BranchFilter Component
 * 
 * Componente para filtrar métricas del dashboard por sucursal
 * Sprint 1 - Fase 6: Integración con métricas reales
 * 
 * Características:
 * - Select de sucursales disponibles
 * - Opción "Todas las sucursales" (sin filtro)
 * - Guarda selección en localStorage
 * - Carga automática de sucursales del tenant
 * - Estados de loading y error
 * - Diseño consistente con el sistema
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Building, Loader2 } from 'lucide-react';
import { useBranches } from '@/app/hooks/useDashboardMetrics';

interface BranchFilterProps {
  /** Sucursal actualmente seleccionada (ID) */
  selectedBranchId: string | null;
  /** Callback cuando cambia la selección */
  onBranchChange: (branchId: string | null) => void;
  /** Clase CSS adicional (opcional) */
  className?: string;
}

export default function BranchFilter({
  selectedBranchId,
  onBranchChange,
  className = '',
}: BranchFilterProps) {
  const { branches, loading, error } = useBranches();
  const [mounted, setMounted] = useState(false);

  // Cargar selección guardada del localStorage al montar
  useEffect(() => {
    setMounted(true);
    const savedBranchId = localStorage.getItem('dashboard-selected-branch');
    if (savedBranchId && !selectedBranchId) {
      onBranchChange(savedBranchId === 'all' ? null : savedBranchId);
    }
  }, []);

  // Manejar cambio de selección
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const branchId = value === 'all' ? null : value;

    // Guardar en localStorage
    localStorage.setItem('dashboard-selected-branch', value);

    // Notificar cambio
    onBranchChange(branchId);
  };

  // No renderizar en el servidor (para evitar hidration mismatch)
  if (!mounted) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Building className="h-4 w-4 text-gray-500" />
      <div className="relative">
        <select
          value={selectedBranchId || 'all'}
          onChange={handleChange}
          disabled={loading || !!error}
          className="
            px-3 py-2 pr-8
            bg-white border border-gray-300 rounded-lg
            text-sm font-medium text-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            cursor-pointer
            hover:bg-gray-50
            transition-colors
            min-w-[200px]
          "
        >
          {/* Opción "Todas las sucursales" */}
          <option value="all">
            Todas las sucursales
          </option>

          {/* Opciones de sucursales */}
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>

        {/* Icono de loading */}
        {loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        )}

        {/* Flecha del select (custom) */}
        {!loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="text-xs text-red-600">
          Error al cargar sucursales
        </div>
      )}
    </div>
  );
}
