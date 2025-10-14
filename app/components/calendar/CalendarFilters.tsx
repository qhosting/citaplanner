'use client';

/**
 * Calendar Filters Component - Phase 4
 * 
 * Filtros y controles del calendario
 */

import React from 'react';
import { CalendarView, FilterOptions } from '@/app/lib/types/calendar';
import { AppointmentStatus } from '@prisma/client';

interface CalendarFiltersProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  selectedBranchId?: string;
  onBranchChange: (branchId: string) => void;
  selectedStatus?: AppointmentStatus | 'ALL';
  onStatusChange: (status: AppointmentStatus | 'ALL') => void;
  selectedServiceId?: string;
  onServiceChange: (serviceId: string) => void;
  selectedProfessionalId?: string;
  onProfessionalChange?: (professionalId: string) => void;
  filterOptions: FilterOptions;
  showProfessionalSelector?: boolean;
}

export default function CalendarFilters({
  view,
  onViewChange,
  selectedBranchId,
  onBranchChange,
  selectedStatus = 'ALL',
  onStatusChange,
  selectedServiceId,
  onServiceChange,
  selectedProfessionalId,
  onProfessionalChange,
  filterOptions,
  showProfessionalSelector = false,
}: CalendarFiltersProps) {
  const views: Array<{ value: CalendarView; label: string; icon: string }> = [
    { value: 'month', label: 'Mes', icon: '📅' },
    { value: 'week', label: 'Semana', icon: '📆' },
    { value: 'day', label: 'Día', icon: '📌' },
    { value: 'agenda', label: 'Agenda', icon: '📋' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Selector de Vista */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vista
          </label>
          <div className="flex space-x-2">
            {views.map((v) => (
              <button
                key={v.value}
                onClick={() => onViewChange(v.value)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  view === v.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{v.icon}</span>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Profesional (solo para admin/gerente) */}
        {showProfessionalSelector && filterOptions.professionals && onProfessionalChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profesional
            </label>
            <select
              value={selectedProfessionalId || ''}
              onChange={(e) => onProfessionalChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterOptions.professionals.map((prof) => (
                <option key={prof.value} value={prof.value}>
                  {prof.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Selector de Sucursal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sucursal
          </label>
          <select
            value={selectedBranchId || 'ALL'}
            onChange={(e) => onBranchChange(e.target.value === 'ALL' ? '' : e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todas las sucursales</option>
            {filterOptions.branches.map((branch) => (
              <option key={branch.value} value={branch.value}>
                {branch.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as AppointmentStatus | 'ALL')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filterOptions.statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Servicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servicio
          </label>
          <select
            value={selectedServiceId || 'ALL'}
            onChange={(e) => onServiceChange(e.target.value === 'ALL' ? '' : e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos los servicios</option>
            {filterOptions.services.map((service) => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
