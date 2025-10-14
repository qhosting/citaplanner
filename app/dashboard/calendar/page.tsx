'use client';

/**
 * Calendar Page - Phase 4
 * 
 * Página principal del calendario profesional
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProfessionalCalendar from '@/app/components/calendar/ProfessionalCalendar';
import CalendarFilters from '@/app/components/calendar/CalendarFilters';
import CalendarLegend from '@/app/components/calendar/CalendarLegend';
import AppointmentModal, { AppointmentFormData } from '@/app/components/calendar/AppointmentModal';
import { CalendarEvent, CalendarView, FilterOptions, getDateRangeForView } from '@/app/lib/types/calendar';
import { AppointmentStatus } from '@prisma/client';
import { toast } from 'react-hot-toast';

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estado del calendario
  const [view, setView] = useState<CalendarView>('week');
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [availability, setAvailability] = useState<any>(null);
  
  // Estado de filtros
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  
  // Estado de opciones de filtros
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    branches: [],
    services: [],
    statuses: [
      { value: 'ALL', label: 'Todos los estados' },
      { value: 'PENDING', label: 'Pendiente' },
      { value: 'CONFIRMED', label: 'Confirmada' },
      { value: 'IN_PROGRESS', label: 'En progreso' },
      { value: 'COMPLETED', label: 'Completada' },
      { value: 'CANCELLED', label: 'Cancelada' },
      { value: 'NO_SHOW', label: 'No asistió' },
    ],
    professionals: [],
  });

  // Estado del modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    appointment?: CalendarEvent;
    initialStartTime?: Date;
    initialEndTime?: Date;
  }>({
    isOpen: false,
    mode: 'create',
  });

  // Estado de carga y datos adicionales
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Determinar si el usuario puede ver otros calendarios
  const canViewOthersCalendar = session?.user?.role === 'ADMIN' || 
                                session?.user?.role === 'SUPER_ADMIN' || 
                                session?.user?.role === 'MANAGER';

  // Cargar opciones de filtros al montar
  useEffect(() => {
    if (status === 'authenticated') {
      loadFilterOptions();
    }
  }, [status]);

  // Cargar eventos cuando cambian los filtros o la fecha
  useEffect(() => {
    if (selectedProfessionalId) {
      loadCalendarEvents();
    }
  }, [selectedProfessionalId, selectedBranchId, selectedStatus, selectedServiceId, date, view]);

  // Función para cargar opciones de filtros
  const loadFilterOptions = async () => {
    try {
      // Cargar sucursales
      const branchesRes = await fetch('/api/branches');
      const branchesData = await branchesRes.json();
      if (branchesData.success) {
        setFilterOptions(prev => ({
          ...prev,
          branches: branchesData.branches.map((b: any) => ({
            value: b.id,
            label: b.name,
          })),
        }));
        setBranches(branchesData.branches);
      }

      // Cargar servicios
      const servicesRes = await fetch('/api/admin/services');
      const servicesData = await servicesRes.json();
      if (servicesData.success) {
        setFilterOptions(prev => ({
          ...prev,
          services: servicesData.services.map((s: any) => ({
            value: s.id,
            label: s.name,
          })),
        }));
        setServices(servicesData.services);
      }

      // Cargar clientes
      const clientsRes = await fetch('/api/clients');
      const clientsData = await clientsRes.json();
      if (clientsData.success) {
        setClients(clientsData.clients.map((c: any) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
        })));
      }

      // Si puede ver otros calendarios, cargar lista de profesionales
      if (canViewOthersCalendar) {
        const professionalsRes = await fetch('/api/professionals');
        const professionalsData = await professionalsRes.json();
        if (professionalsData.success) {
          const profOptions = professionalsData.professionals.map((p: any) => ({
            value: p.id,
            label: `${p.user.firstName} ${p.user.lastName}`,
          }));
          setFilterOptions(prev => ({
            ...prev,
            professionals: profOptions,
          }));
          
          // Seleccionar el primer profesional por defecto
          if (profOptions.length > 0) {
            setSelectedProfessionalId(profOptions[0].value);
          }
        }
      } else {
        // Si es profesional, obtener su propio ID
        const userRes = await fetch('/api/professionals/me');
        const userData = await userRes.json();
        if (userData.success && userData.professional) {
          setSelectedProfessionalId(userData.professional.id);
        }
      }
    } catch (error) {
      console.error('Error al cargar opciones de filtros:', error);
      toast.error('Error al cargar opciones de filtros');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar eventos del calendario
  const loadCalendarEvents = async () => {
    try {
      const { start, end } = getDateRangeForView(date, view);
      
      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      if (selectedBranchId) params.append('branchId', selectedBranchId);
      if (selectedStatus && selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedServiceId) params.append('serviceId', selectedServiceId);

      const res = await fetch(`/api/calendar/professional/${selectedProfessionalId}?${params}`);
      const data = await res.json();

      if (data.success) {
        // Convertir fechas de string a Date
        const eventsWithDates = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        
        setEvents(eventsWithDates);
        setAvailability(data.availability);
      } else {
        toast.error(data.message || 'Error al cargar eventos');
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      toast.error('Error al cargar eventos del calendario');
    }
  };

  // Manejar selección de slot para crear cita
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setModalState({
      isOpen: true,
      mode: 'create',
      initialStartTime: slotInfo.start,
      initialEndTime: slotInfo.end,
    });
  }, []);

  // Manejar selección de evento para ver/editar
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      appointment: event,
    });
  }, []);

  // Manejar drag & drop de eventos
  const handleEventDrop = useCallback(async (data: { event: CalendarEvent; start: Date; end: Date }) => {
    try {
      const res = await fetch(`/api/calendar/appointments/${data.event.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStartTime: data.start.toISOString(),
          newEndTime: data.end.toISOString(),
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Cita reprogramada exitosamente');
        loadCalendarEvents();
      } else {
        toast.error(result.message || 'Error al reprogramar cita');
        // Revertir cambio visual
        loadCalendarEvents();
      }
    } catch (error) {
      console.error('Error al reprogramar cita:', error);
      toast.error('Error al reprogramar cita');
      loadCalendarEvents();
    }
  }, [loadCalendarEvents]);

  // Manejar guardar cita
  const handleSaveAppointment = async (formData: AppointmentFormData) => {
    try {
      const endpoint = modalState.mode === 'create' 
        ? '/api/calendar/appointments'
        : `/api/calendar/appointments/${modalState.appointment?.id}`;
      
      const method = modalState.mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: selectedProfessionalId,
          ...formData,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(modalState.mode === 'create' ? 'Cita creada exitosamente' : 'Cita actualizada exitosamente');
        setModalState({ isOpen: false, mode: 'create' });
        loadCalendarEvents();
      } else {
        throw new Error(result.message || 'Error al guardar cita');
      }
    } catch (error: any) {
      throw error;
    }
  };

  // Manejar cancelar cita
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Cita cancelada exitosamente');
        setModalState({ isOpen: false, mode: 'create' });
        loadCalendarEvents();
      } else {
        throw new Error(result.message || 'Error al cancelar cita');
      }
    } catch (error: any) {
      throw error;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
        <p className="text-gray-600 mt-2">
          Gestiona citas y visualiza la disponibilidad
        </p>
      </div>

      {/* Filtros */}
      <CalendarFilters
        view={view}
        onViewChange={setView}
        selectedBranchId={selectedBranchId}
        onBranchChange={setSelectedBranchId}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedServiceId={selectedServiceId}
        onServiceChange={setSelectedServiceId}
        selectedProfessionalId={selectedProfessionalId}
        onProfessionalChange={setSelectedProfessionalId}
        filterOptions={filterOptions}
        showProfessionalSelector={canViewOthersCalendar}
      />

      {/* Leyenda */}
      <CalendarLegend />

      {/* Calendario */}
      {selectedProfessionalId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <ProfessionalCalendar
            events={events}
            view={view}
            date={date}
            onNavigate={setDate}
            onView={setView}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventDrop}
            availabilityBlocks={availability?.blocks || []}
          />
        </div>
      )}

      {!selectedProfessionalId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Selecciona un profesional para ver su calendario</p>
        </div>
      )}

      {/* Modal de cita */}
      <AppointmentModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        onSave={handleSaveAppointment}
        onCancel={handleCancelAppointment}
        appointment={modalState.appointment}
        professionalId={selectedProfessionalId}
        initialStartTime={modalState.initialStartTime}
        initialEndTime={modalState.initialEndTime}
        clients={clients}
        services={services}
        branches={branches}
        mode={modalState.mode}
      />
    </div>
  );
}
