
/**
 * NotificationCenter Component
 * 
 * Panel central de notificaciones con lista, filtros y acciones
 */

'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, Check, CheckCheck, Filter, Trash2, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function NotificationCenter() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } =
    useNotificationStore();
  const { emit } = useSocket();

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'read' && !notification.isRead) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  // Obtener tipos únicos de notificaciones
  const notificationTypes = Array.from(
    new Set(notifications.map((n) => n.type))
  );

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    emit('notification:read', id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    emit('notification:read:all');
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        deleteNotification(id);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-4 border-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'appointment:created': 'Cita Creada',
      'appointment:updated': 'Cita Actualizada',
      'appointment:cancelled': 'Cita Cancelada',
      'appointment:reminder': 'Recordatorio',
      'appointment:rescheduled': 'Cita Reprogramada',
      'schedule:updated': 'Horario Actualizado',
      'system:alert': 'Alerta del Sistema',
      'commission:earned': 'Comisión Generada',
      'payment:received': 'Pago Recibido',
    };
    return labels[type] || type;
  };

  const getPriorityBadgeVariant = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando notificaciones...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Centro de Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} sin leer</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Gestiona todas tus notificaciones en un solo lugar
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">
                  Todas ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  No leídas ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read">
                  Leídas ({notifications.length - unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {notificationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Lista de notificaciones */}
          <ScrollArea className="h-[600px] pr-4">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay notificaciones</p>
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread'
                    ? 'No tienes notificaciones sin leer'
                    : 'Aquí aparecerán tus notificaciones'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`${getPriorityColor(notification.priority)} ${
                      notification.isRead ? 'opacity-60' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            {notification.priority && (
                              <Badge
                                variant={getPriorityBadgeVariant(
                                  notification.priority
                                )}
                              >
                                {notification.priority}
                              </Badge>
                            )}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>

                          <p className="text-sm font-medium mb-1">
                            {notification.message}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                                locale: es,
                              }
                            )}
                          </p>

                          {notification.data && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {notification.data.appointmentId && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0"
                                  onClick={() => {
                                    window.location.href = `/appointments/${notification.data.appointmentId}`;
                                  }}
                                >
                                  Ver cita
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Marcar como leída"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

