
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Loader2, RefreshCw, Eye } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationType, NotificationChannel, NotificationStatus } from '@/types/notifications'
import type { NotificationLog } from '@/types/notifications'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function HistoryTab() {
  const { fetchLogs, loading } = useNotifications()
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    channel: '',
    status: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadLogs()
  }, [page, filters])

  const loadLogs = async () => {
    const result = await fetchLogs({
      ...filters,
      page,
      limit: 20
    })
    setLogs(result.logs)
    setTotal(result.total)
  }

  const handleViewDetails = (log: NotificationLog) => {
    setSelectedLog(log)
    setDetailsOpen(true)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SENT: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-green-100 text-green-800',
      READ: 'bg-purple-100 text-purple-800',
      FAILED: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      SENT: 'Enviada',
      DELIVERED: 'Entregada',
      READ: 'Leída',
      FAILED: 'Fallida'
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      APPOINTMENT_REMINDER: 'Recordatorio',
      APPOINTMENT_CONFIRMATION: 'Confirmación',
      APPOINTMENT_CANCELLATION: 'Cancelación',
      APPOINTMENT_RESCHEDULED: 'Reprogramada',
      PAYMENT_REMINDER: 'Pago Recordatorio',
      PAYMENT_CONFIRMATION: 'Pago Confirmación',
      PROMOTION: 'Promoción',
      BIRTHDAY: 'Cumpleaños',
      CUSTOM: 'Personalizado'
    }
    return labels[type] || type
  }

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      EMAIL: 'Email',
      SMS: 'SMS',
      WHATSAPP: 'WhatsApp',
      PUSH: 'Push'
    }
    return labels[channel] || channel
  }

  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === 'SENT' || l.status === 'DELIVERED' || l.status === 'READ').length,
    delivered: logs.filter(l => l.status === 'DELIVERED' || l.status === 'READ').length,
    failed: logs.filter(l => l.status === 'FAILED').length
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Notificaciones</CardTitle>
              <CardDescription>
                Registro completo de todas las notificaciones enviadas
              </CardDescription>
            </div>
            <Button onClick={loadLogs} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value={NotificationType.APPOINTMENT_REMINDER}>Recordatorio</SelectItem>
                <SelectItem value={NotificationType.APPOINTMENT_CONFIRMATION}>Confirmación</SelectItem>
                <SelectItem value={NotificationType.PROMOTION}>Promoción</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.channel}
              onValueChange={(value) => setFilters({ ...filters, channel: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los canales</SelectItem>
                <SelectItem value={NotificationChannel.EMAIL}>Email</SelectItem>
                <SelectItem value={NotificationChannel.SMS}>SMS</SelectItem>
                <SelectItem value={NotificationChannel.WHATSAPP}>WhatsApp</SelectItem>
                <SelectItem value={NotificationChannel.PUSH}>Push</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value={NotificationStatus.SENT}>Enviada</SelectItem>
                <SelectItem value={NotificationStatus.DELIVERED}>Entregada</SelectItem>
                <SelectItem value={NotificationStatus.FAILED}>Fallida</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Fecha inicio"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-[180px]"
            />

            <Input
              type="date"
              placeholder="Fecha fin"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-[180px]"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron notificaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>{getTypeLabel(log.type)}</TableCell>
                      <TableCell>{getChannelLabel(log.channel)}</TableCell>
                      <TableCell className="font-mono text-sm">{log.recipient}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {getStatusLabel(log.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {total > 20 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Mostrando {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} de {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 20 >= total}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Notificación</DialogTitle>
            <DialogDescription>
              Información completa de la notificación enviada
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p className="text-sm">{getTypeLabel(selectedLog.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Canal</p>
                  <p className="text-sm">{getChannelLabel(selectedLog.channel)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Destinatario</p>
                  <p className="text-sm font-mono">{selectedLog.recipient}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <Badge className={getStatusColor(selectedLog.status)}>
                    {getStatusLabel(selectedLog.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Envío</p>
                  <p className="text-sm">
                    {format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                  </p>
                </div>
                {selectedLog.deliveredAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Entrega</p>
                    <p className="text-sm">
                      {format(new Date(selectedLog.deliveredAt), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                    </p>
                  </div>
                )}
              </div>

              {selectedLog.subject && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Asunto</p>
                  <p className="text-sm">{selectedLog.subject}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Mensaje</p>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{selectedLog.message}</p>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">Error</p>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">{selectedLog.errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
