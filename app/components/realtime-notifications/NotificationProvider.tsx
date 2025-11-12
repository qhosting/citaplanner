/**
 * NotificationProvider Component
 * 
 * Proveedor de contexto para gestionar notificaciones en tiempo real
 */

'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { on, off, isConnected } = useSocket();
  const { addNotification, setNotifications, setLoading } = useNotificationStore();

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (!session) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/notifications?limit=50');
        if (response.ok) {
          const data = await response.json();
          const notifications = data.notifications.map((n: any) => ({
            id: n.id,
            type: n.type,
            message: n.message,
            data: n.metadata?.eventData,
            isRead: !!n.readAt,
            createdAt: new Date(n.createdAt),
            priority: n.metadata?.priority || 'medium',
          }));
          setNotifications(notifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session, setNotifications, setLoading]);

  // Escuchar eventos en tiempo real
  useEffect(() => {
    if (!isConnected) return;

    // Nueva notificación
    const handleNewNotification = (notification: any) => {
      addNotification({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        data: notification.data,
        isRead: false,
        createdAt: new Date(notification.createdAt),
        priority: notification.priority,
      });

      // Mostrar toast
      toast.info(notification.message, {
        description: notification.data?.appointmentId 
          ? 'Click para ver más detalles'
          : undefined,
        action: notification.data?.appointmentId ? {
          label: 'Ver',
          onClick: () => {
            window.location.href = `/appointments/${notification.data.appointmentId}`;
          },
        } : undefined,
      });
    };

    // Cita creada
    const handleAppointmentCreated = (data: any) => {
      toast.success('Nueva cita creada', {
        description: `${data.appointment.clientName} - ${data.appointment.serviceName}`,
      });
    };

    // Cita actualizada
    const handleAppointmentUpdated = (data: any) => {
      toast.info('Cita actualizada', {
        description: `${data.appointment.clientName}`,
      });
    };

    // Cita eliminada
    const handleAppointmentDeleted = (data: any) => {
      toast.warning('Cita cancelada', {
        description: data.appointmentData.clientName,
      });
    };

    // Cita reprogramada
    const handleAppointmentRescheduled = (data: any) => {
      toast.info('Cita reprogramada', {
        description: `${data.appointment.clientName} - Nueva hora: ${new Date(data.newTime.start).toLocaleTimeString()}`,
      });
    };

    // Actualización de horarios
    const handleScheduleUpdated = (data: any) => {
      toast.info('Horarios actualizados');
    };

    // Refrescar calendario
    const handleCalendarRefresh = (data: any) => {
      // Disparar evento personalizado para que el calendario se refresque
      window.dispatchEvent(new CustomEvent('calendar:refresh', { detail: data }));
    };

    // Alerta del sistema
    const handleSystemAlert = (notification: any) => {
      const severity = notification.data?.severity || 'info';
      
      if (severity === 'error') {
        toast.error(notification.message);
      } else if (severity === 'warning') {
        toast.warning(notification.message);
      } else {
        toast.info(notification.message);
      }
    };

    // Registrar event listeners
    on('notification:new', handleNewNotification);
    on('appointment:created', handleAppointmentCreated);
    on('appointment:updated', handleAppointmentUpdated);
    on('appointment:deleted', handleAppointmentDeleted);
    on('appointment:rescheduled', handleAppointmentRescheduled);
    on('schedule:updated', handleScheduleUpdated);
    on('calendar:refresh', handleCalendarRefresh);
    on('system:alert', handleSystemAlert);

    return () => {
      off('notification:new', handleNewNotification);
      off('appointment:created', handleAppointmentCreated);
      off('appointment:updated', handleAppointmentUpdated);
      off('appointment:deleted', handleAppointmentDeleted);
      off('appointment:rescheduled', handleAppointmentRescheduled);
      off('schedule:updated', handleScheduleUpdated);
      off('calendar:refresh', handleCalendarRefresh);
      off('system:alert', handleSystemAlert);
    };
  }, [isConnected, on, off, addNotification]);

  return <>{children}</>;
}
