'use client';

/**
 * Appointment Modal Component - Phase 4
 * 
 * Modal para crear/editar citas desde el calendario
 */

import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '@/app/lib/types/calendar';
import { AppointmentStatus } from '@prisma/client';
import { format } from 'date-fns';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AppointmentFormData) => Promise<void>;
  onCancel?: (appointmentId: string) => Promise<void>;
  appointment?: CalendarEvent;
  professionalId: string;
  initialStartTime?: Date;
  initialEndTime?: Date;
  clients: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string; duration: number }>;
  branches: Array<{ id: string; name: string }>;
  mode: 'create' | 'edit' | 'view';
}

export interface AppointmentFormData {
  clientId: string;
  serviceId: string;
  branchId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  onCancel,
  appointment,
  professionalId,
  initialStartTime,
  initialEndTime,
  clients,
  services,
  branches,
  mode,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientId: '',
    serviceId: '',
    branchId: '',
    startTime: initialStartTime || new Date(),
    endTime: initialEndTime || new Date(),
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar datos del formulario
  useEffect(() => {
    if (appointment && mode === 'edit') {
      setFormData({
        clientId: appointment.resource?.clientId || '',
        serviceId: appointment.resource?.serviceId || '',
        branchId: appointment.resource?.branchId || '',
        startTime: appointment.start,
        endTime: appointment.end,
        notes: appointment.resource?.notes || '',
      });
    } else if (mode === 'create' && initialStartTime && initialEndTime) {
      setFormData({
        ...formData,
        startTime: initialStartTime,
        endTime: initialEndTime,
      });
    }
  }, [appointment, mode, initialStartTime, initialEndTime]);

  // Actualizar endTime cuando cambia el servicio
  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const newEndTime = new Date(formData.startTime.getTime() + service.duration * 60000);
      setFormData({
        ...formData,
        serviceId,
        endTime: newEndTime,
      });
    } else {
      setFormData({
        ...formData,
        serviceId,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment?.id || !onCancel) return;
    
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      setLoading(true);
      try {
        await onCancel(appointment.id);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Error al cancelar la cita');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'create' && 'Nueva Cita'}
              {mode === 'edit' && 'Editar Cita'}
              {mode === 'view' && 'Detalles de la Cita'}
            </h3>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Sucursal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursal *
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccionar sucursal</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha y Hora de inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Inicio *
                </label>
                <input
                  type="datetime-local"
                  value={format(formData.startTime, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value) })}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Fecha y Hora de fin */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Fin *
                </label>
                <input
                  type="datetime-local"
                  value={format(formData.endTime, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value) })}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Notas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={isReadOnly}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            {/* Estado (solo en modo view/edit) */}
            {mode !== 'create' && appointment?.resource?.status && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Estado:</span>{' '}
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full" style={{
                    backgroundColor: appointment.resource.status === 'COMPLETED' ? '#DEF7EC' : 
                                     appointment.resource.status === 'CANCELLED' ? '#FDE8E8' : '#DBEAFE',
                    color: appointment.resource.status === 'COMPLETED' ? '#03543F' : 
                           appointment.resource.status === 'CANCELLED' ? '#9B1C1C' : '#1E3A8A',
                  }}>
                    {appointment.resource.status}
                  </span>
                </p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isReadOnly ? 'Cerrar' : 'Cancelar'}
            </button>
            
            {!isReadOnly && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            )}
            
            {mode === 'edit' && onCancel && appointment?.resource?.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={handleCancelAppointment}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                Cancelar Cita
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
