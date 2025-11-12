
/**
 * NotificationToast Component
 * 
 * Componente de toast para mostrar notificaciones instantáneas
 */

'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';
import { Bell, Calendar, AlertTriangle, DollarSign, Clock } from 'lucide-react';

export function NotificationToast() {
  const { on, off, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Nueva notificación genérica
    const handleNewNotification = (notification: any) => {
      const icon = getIconForType(notification.type);
      const description = notification.data?.description || undefined;

      toast.info(notification.message, {
        icon,
        description,
        duration: 5000,
        action: notification.data?.actionUrl
          ? {
              label: 'Ver',
              onClick: () => {
                window.location.href = notification.data.actionUrl;
              },
            }
          : undefined,
      });
    };

    // Cita creada
    const handleAppointmentCreated = (data: any) => {
      toast.success('✨ Nueva cita creada', {
        description: `${data.appointment.clientName} - ${data.appointment.serviceName}`,
        icon: <Calendar className="h-4 w-4" />,
        duration: 5000,
        action: data.appointment.id
          ? {
              label: 'Ver',
              onClick: () => {
                window.location.href = `/appointments/${data.appointment.id}`;
              },
            }
          : undefined,
      });

      // Reproducir sonido (si está habilitado)
      playNotificationSound();
    };

    // Cita actualizada
    const handleAppointmentUpdated = (data: any) => {
      toast.info('📝 Cita actualizada', {
        description: data.appointment.clientName,
        icon: <Calendar className="h-4 w-4" />,
        duration: 4000,
      });

      playNotificationSound();
    };

    // Cita eliminada/cancelada
    const handleAppointmentDeleted = (data: any) => {
      toast.warning('❌ Cita cancelada', {
        description: data.appointmentData.clientName,
        icon: <Calendar className="h-4 w-4" />,
        duration: 5000,
      });

      playNotificationSound();
    };

    // Cita reprogramada
    const handleAppointmentRescheduled = (data: any) => {
      const newTime = new Date(data.newTime.start).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });

      toast.info('🔄 Cita reprogramada', {
        description: `${data.appointment.clientName} - Nueva hora: ${newTime}`,
        icon: <Clock className="h-4 w-4" />,
        duration: 5000,
      });

      playNotificationSound();
    };

    // Recordatorio de cita
    const handleAppointmentReminder = (data: any) => {
      const minutesBefore = data.minutesBefore || 60;

      toast.warning(`⏰ Recordatorio: Cita en ${minutesBefore} minutos`, {
        description: `${data.appointment.clientName} - ${data.appointment.serviceName}`,
        icon: <Bell className="h-4 w-4" />,
        duration: 10000,
        action: {
          label: 'Ver',
          onClick: () => {
            window.location.href = `/appointments/${data.appointment.id}`;
          },
        },
      });

      playNotificationSound('reminder');
    };

    // Actualización de horarios
    const handleScheduleUpdated = (data: any) => {
      toast.info('🕐 Horarios actualizados', {
        description: data.professionalName
          ? `Profesional: ${data.professionalName}`
          : undefined,
        icon: <Calendar className="h-4 w-4" />,
        duration: 4000,
      });
    };

    // Comisión generada
    const handleCommissionEarned = (data: any) => {
      toast.success(`💰 Comisión generada: ${data.amount}`, {
        description: data.description,
        icon: <DollarSign className="h-4 w-4" />,
        duration: 6000,
      });

      playNotificationSound('success');
    };

    // Alerta del sistema
    const handleSystemAlert = (notification: any) => {
      const severity = notification.data?.severity || 'info';

      if (severity === 'error') {
        toast.error(notification.message, {
          description: notification.data?.description,
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 8000,
        });
      } else if (severity === 'warning') {
        toast.warning(notification.message, {
          description: notification.data?.description,
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 6000,
        });
      } else {
        toast.info(notification.message, {
          description: notification.data?.description,
          duration: 5000,
        });
      }

      playNotificationSound();
    };

    // Usuario online/offline
    const handleUserOnline = (data: any) => {
      // Toast silencioso para no saturar
      console.log(`User ${data.email} is online`);
    };

    const handleUserOffline = (data: any) => {
      console.log(`User ${data.userId} went offline`);
    };

    // Registrar event listeners
    on('notification:new', handleNewNotification);
    on('appointment:created', handleAppointmentCreated);
    on('appointment:updated', handleAppointmentUpdated);
    on('appointment:deleted', handleAppointmentDeleted);
    on('appointment:rescheduled', handleAppointmentRescheduled);
    on('appointment:reminder', handleAppointmentReminder);
    on('schedule:updated', handleScheduleUpdated);
    on('commission:earned', handleCommissionEarned);
    on('system:alert', handleSystemAlert);
    on('user:online', handleUserOnline);
    on('user:offline', handleUserOffline);

    return () => {
      off('notification:new', handleNewNotification);
      off('appointment:created', handleAppointmentCreated);
      off('appointment:updated', handleAppointmentUpdated);
      off('appointment:deleted', handleAppointmentDeleted);
      off('appointment:rescheduled', handleAppointmentRescheduled);
      off('appointment:reminder', handleAppointmentReminder);
      off('schedule:updated', handleScheduleUpdated);
      off('commission:earned', handleCommissionEarned);
      off('system:alert', handleSystemAlert);
      off('user:online', handleUserOnline);
      off('user:offline', handleUserOffline);
    };
  }, [isConnected, on, off]);

  return null;
}

// Helper: Obtener icono según tipo de notificación
function getIconForType(type: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    'appointment:created': <Calendar className="h-4 w-4" />,
    'appointment:updated': <Calendar className="h-4 w-4" />,
    'appointment:cancelled': <Calendar className="h-4 w-4" />,
    'appointment:reminder': <Bell className="h-4 w-4" />,
    'appointment:rescheduled': <Clock className="h-4 w-4" />,
    'schedule:updated': <Calendar className="h-4 w-4" />,
    'system:alert': <AlertTriangle className="h-4 w-4" />,
    'commission:earned': <DollarSign className="h-4 w-4" />,
  };

  return icons[type] || <Bell className="h-4 w-4" />;
}

// Helper: Reproducir sonido de notificación
function playNotificationSound(type: 'default' | 'reminder' | 'success' = 'default') {
  // Verificar preferencias del usuario (esto debería venir del store)
  const enableSounds = localStorage.getItem('notification_sounds') !== 'false';

  if (!enableSounds) return;

  // Crear y reproducir audio
  try {
    const audio = new Audio();
    
    // URLs de sonidos según tipo
    const soundUrls: Record<string, string> = {
      default: '/sounds/notification.mp3',
      reminder: '/sounds/reminder.mp3',
      success: '/sounds/success.mp3',
    };

    audio.src = soundUrls[type] || soundUrls.default;
    audio.volume = 0.5;
    audio.play().catch((error) => {
      // Ignorar errores de autoplay
      console.debug('Could not play notification sound:', error);
    });
  } catch (error) {
    console.debug('Error playing notification sound:', error);
  }
}

