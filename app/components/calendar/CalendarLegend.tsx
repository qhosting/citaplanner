'use client';

/**
 * Calendar Legend Component - Phase 4
 * 
 * Leyenda de colores y estados del calendario
 */

import React from 'react';
import { getStatusColor } from '@/app/lib/types/calendar';
import { AppointmentStatus } from '@prisma/client';

export default function CalendarLegend() {
  const statuses: Array<{ status: AppointmentStatus; label: string }> = [
    { status: 'PENDING', label: 'Pendiente' },
    { status: 'CONFIRMED', label: 'Confirmada' },
    { status: 'IN_PROGRESS', label: 'En progreso' },
    { status: 'COMPLETED', label: 'Completada' },
    { status: 'CANCELLED', label: 'Cancelada' },
    { status: 'NO_SHOW', label: 'No asistió' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Leyenda</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statuses.map((item) => (
          <div key={item.status} className="flex items-center">
            <div
              className="w-4 h-4 rounded mr-2"
              style={{ backgroundColor: getStatusColor(item.status) }}
            />
            <span className="text-xs text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2" />
            <span className="text-xs text-gray-700">No disponible</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 rounded mr-2" />
            <span className="text-xs text-gray-700">Día actual</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded mr-2" />
            <span className="text-xs text-gray-700">Disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
