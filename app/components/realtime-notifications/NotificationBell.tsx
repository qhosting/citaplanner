/**
 * NotificationBell Component
 * 
 * Icono de campana con contador de notificaciones no leídas
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { useSocket } from '@/hooks/useSocket';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const { on, off, emit } = useSocket();

  // Obtener las últimas 5 notificaciones
  const recentNotifications = notifications.slice(0, 5);

  useEffect(() => {
    // Escuchar nuevas notificaciones
    const handleNewNotification = (notification: any) => {
      useNotificationStore.getState().addNotification({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        data: notification.data,
        isRead: false,
        createdAt: new Date(notification.createdAt),
        priority: notification.priority,
      });

      // Mostrar notificación del navegador si está permitido
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('CitaPlanner', {
          body: notification.message,
          icon: '/logo.png',
          tag: notification.id,
        });
      }
    };

    on('notification:new', handleNewNotification);

    return () => {
      off('notification:new', handleNewNotification);
    };
  }, [on, off]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    emit('notification:read', id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    emit('notification:read:all');
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-300';
      case 'high':
        return 'bg-orange-100 border-orange-300';
      case 'medium':
        return 'bg-blue-100 border-blue-300';
      case 'low':
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-blue-100 border-blue-300';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No tienes notificaciones
          </div>
        ) : (
          <>
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer border-l-4 ${
                  notification.isRead ? 'opacity-60' : ''
                } ${getPriorityColor(notification.priority)}`}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <p className="text-sm font-medium line-clamp-2">
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-center">
              <Button
                variant="link"
                className="w-full"
                onClick={() => {
                  // Navegar al centro de notificaciones
                  window.location.href = '/notifications';
                }}
              >
                Ver todas las notificaciones
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
