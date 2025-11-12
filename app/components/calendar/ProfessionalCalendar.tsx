'use client';

/**
 * Professional Calendar Component - Phase 4 + Phase 5 Real-Time Integration
 * 
 * Componente principal del calendario con drag & drop y sincronización en tiempo real
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Event as BigCalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent, CalendarView, getStatusColor } from '@/app/lib/types/calendar';
import { AppointmentStatus } from '@prisma/client';
import { useSocket } from '@/hooks/useSocket';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configurar localizer con date-fns
const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ProfessionalCalendarProps {
  events: CalendarEvent[];
  view: CalendarView;
  date: Date;
  onNavigate: (newDate: Date) => void;
  onView: (newView: CalendarView) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onEventDrop?: (data: { event: CalendarEvent; start: Date; end: Date }) => void;
  onEventResize?: (data: { event: CalendarEvent; start: Date; end: Date }) => void;
  availabilityBlocks?: Array<{ start: Date; end: Date; isAvailable: boolean }>;
  loading?: boolean;
}

export default function ProfessionalCalendar({
  events,
  view,
  date,
  onNavigate,
  onView,
  onSelectEvent,
  onSelectSlot,
  onEventDrop,
  onEventResize,
  availabilityBlocks = [],
  loading = false,
}: ProfessionalCalendarProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { on, off, emit, isConnected } = useSocket();

  // Integración con WebSocket para sincronización en tiempo real
  useEffect(() => {
    if (!isConnected) return;

    // Emitir que estamos viendo el calendario
    emit('calendar:viewing', {
      date: format(date, 'yyyy-MM-dd'),
      viewType: view,
    });

    // Escuchar eventos de cambios en citas
    const handleAppointmentCreated = () => {
      // Forzar refresh del calendario
      setRefreshKey(prev => prev + 1);
    };

    const handleAppointmentUpdated = () => {
      setRefreshKey(prev => prev + 1);
    };

    const handleAppointmentDeleted = () => {
      setRefreshKey(prev => prev + 1);
    };

    const handleAppointmentRescheduled = () => {
      setRefreshKey(prev => prev + 1);
    };

    const handleScheduleUpdated = () => {
      setRefreshKey(prev => prev + 1);
    };

    const handleCalendarRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Registrar event listeners
    on('appointment:created', handleAppointmentCreated);
    on('appointment:updated', handleAppointmentUpdated);
    on('appointment:deleted', handleAppointmentDeleted);
    on('appointment:rescheduled', handleAppointmentRescheduled);
    on('schedule:updated', handleScheduleUpdated);
    on('calendar:refresh', handleCalendarRefresh);

    // Custom event listener para refresh manual
    const handleCustomRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('calendar:refresh', handleCustomRefresh);

    return () => {
      off('appointment:created', handleAppointmentCreated);
      off('appointment:updated', handleAppointmentUpdated);
      off('appointment:deleted', handleAppointmentDeleted);
      off('appointment:rescheduled', handleAppointmentRescheduled);
      off('schedule:updated', handleScheduleUpdated);
      off('calendar:refresh', handleCalendarRefresh);
      window.removeEventListener('calendar:refresh', handleCustomRefresh);
    };
  }, [isConnected, on, off, emit, date, view]);

  // Configuración de estilos personalizados
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const status = event.resource?.status;
      const backgroundColor = status ? getStatusColor(status) : '#3B82F6';
      
      return {
        style: {
          backgroundColor,
          borderRadius: '5px',
          opacity: 0.9,
          color: 'white',
          border: '0px',
          display: 'block',
          fontSize: '0.875rem',
          padding: '2px 5px',
        },
      };
    },
    []
  );

  // Configuración de slots de tiempo
  const slotStyleGetter = useCallback(
    (date: Date) => {
      // Verificar si el slot está en un bloque disponible
      const isAvailable = availabilityBlocks.some(
        block =>
          block.isAvailable &&
          date >= block.start &&
          date < block.end
      );

      if (!isAvailable) {
        return {
          style: {
            backgroundColor: '#F3F4F6', // gray-100
            cursor: 'not-allowed',
          },
        };
      }

      return {};
    },
    [availabilityBlocks]
  );

  // Manejo de drag & drop
  const handleEventDrop = useCallback(
    (data: { event: BigCalendarEvent; start: Date; end: Date }) => {
      if (onEventDrop) {
        onEventDrop({
          event: data.event as CalendarEvent,
          start: data.start,
          end: data.end,
        });
      }
    },
    [onEventDrop]
  );

  // Manejo de resize
  const handleEventResize = useCallback(
    (data: { event: BigCalendarEvent; start: Date; end: Date }) => {
      if (onEventResize) {
        onEventResize({
          event: data.event as CalendarEvent,
          start: data.start,
          end: data.end,
        });
      }
    },
    [onEventResize]
  );

  // Configuración de mensajes en español
  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay citas en este rango',
    showMore: (total: number) => `+ Ver más (${total})`,
  };

  // Formatos personalizados
  const formats = {
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
    dayHeaderFormat: (date: Date) => format(date, 'EEEE, dd MMMM', { locale: es }),
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, 'dd MMM', { locale: es })} - ${format(end, 'dd MMM', { locale: es })}`,
    monthHeaderFormat: (date: Date) => format(date, 'MMMM yyyy', { locale: es }),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="calendar-container h-full">
      <style jsx global>{`
        .calendar-container {
          height: calc(100vh - 200px);
          min-height: 600px;
        }
        
        .rbc-calendar {
          font-family: inherit;
        }
        
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
          font-size: 0.875rem;
          background-color: #F9FAFB;
          border-bottom: 2px solid #E5E7EB;
        }
        
        .rbc-today {
          background-color: #EFF6FF;
        }
        
        .rbc-off-range-bg {
          background-color: #F9FAFB;
        }
        
        .rbc-event {
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .rbc-event:hover {
          opacity: 1 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .rbc-selected {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
        }
        
        .rbc-time-slot {
          min-height: 40px;
        }
        
        .rbc-timeslot-group {
          min-height: 80px;
        }
        
        .rbc-current-time-indicator {
          background-color: #EF4444;
          height: 2px;
        }
        
        .rbc-toolbar {
          padding: 15px 0;
          margin-bottom: 10px;
        }
        
        .rbc-toolbar button {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #D1D5DB;
          background-color: white;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .rbc-toolbar button:hover {
          background-color: #F3F4F6;
        }
        
        .rbc-toolbar button.rbc-active {
          background-color: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }
      `}</style>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={view}
        date={date}
        onNavigate={onNavigate}
        onView={onView}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        eventPropGetter={eventStyleGetter}
        slotPropGetter={slotStyleGetter}
        selectable
        resizable
        popup
        messages={messages}
        formats={formats}
        step={30}
        timeslots={2}
        min={new Date(2025, 0, 1, 8, 0, 0)}
        max={new Date(2025, 0, 1, 20, 0, 0)}
        culture="es"
        components={{
          event: ({ event }: { event: CalendarEvent }) => (
            <div className="text-xs font-medium truncate">
              <div className="font-semibold">{event.resource?.clientName}</div>
              <div className="text-xs opacity-90">{event.resource?.serviceName}</div>
            </div>
          ),
        }}
      />
    </div>
  );
}
