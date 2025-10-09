'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Clock, User, Loader2 } from 'lucide-react';
import type { ClientHistoryProps, ClientHistory as ClientHistoryType } from '@/lib/clients/types';

/**
 * Client History Component
 * Displays appointment and service history for a client
 */
export default function ClientHistory({ clientId }: ClientHistoryProps) {
  const [history, setHistory] = useState<ClientHistoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/clients/profiles/${clientId}/history`);
        
        if (!response.ok) {
          throw new Error('Error al cargar el historial');
        }

        const data = await response.json();
        
        if (data.success) {
          setHistory(data.data);
        } else {
          throw new Error(data.error || 'Error al cargar el historial');
        }
      } catch (err) {
        console.error('Error fetching client history:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [clientId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pendiente', variant: 'secondary' },
      CONFIRMED: { label: 'Confirmada', variant: 'default' },
      COMPLETED: { label: 'Completada', variant: 'outline' },
      CANCELLED: { label: 'Cancelada', variant: 'destructive' },
      NO_SHOW: { label: 'No asistió', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">Cargando historial...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!history) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{history.totalAppointments}</p>
                <p className="text-sm text-gray-600">Citas totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(history.totalSpent)}</p>
                <p className="text-sm text-gray-600">Total gastado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {history.lastVisit ? formatDate(history.lastVisit) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Última visita</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service History */}
      {history.services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Servicios Más Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.services.map((service) => (
                <div
                  key={service.serviceId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{service.serviceName}</p>
                    <p className="text-sm text-gray-600">
                      {service.count} {service.count === 1 ? 'vez' : 'veces'} • Última:{' '}
                      {formatDate(service.lastDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(service.totalSpent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {history.appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hay citas registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:border-gray-400 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{formatDate(appointment.date)}</p>
                        <p className="text-sm text-gray-600">
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {appointment.service && (
                      <div>
                        <p className="text-gray-600">Servicio</p>
                        <p className="font-medium">{appointment.service.name}</p>
                        <p className="text-green-600">{formatCurrency(appointment.service.price)}</p>
                      </div>
                    )}

                    {appointment.professional && (
                      <div>
                        <p className="text-gray-600">Profesional</p>
                        <p className="font-medium">
                          {appointment.professional.firstName} {appointment.professional.lastName}
                        </p>
                      </div>
                    )}
                  </div>

                  {appointment.payments && appointment.payments.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-600 mb-2">Pagos</p>
                      <div className="flex flex-wrap gap-2">
                        {appointment.payments.map((payment) => (
                          <Badge key={payment.id} variant="outline">
                            {formatCurrency(payment.amount)} - {payment.method} ({payment.status})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
