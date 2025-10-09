
'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AppointmentModal } from '@/components/modals/appointment-modal'
import { toast } from 'react-hot-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const statusColors: any = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
}

const statusLabels: any = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No Asistió',
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/appointments')
      const result = await response.json()

      if (result.success) {
        setAppointments(result.data)
      } else {
        throw new Error(result.error || 'Error al cargar citas')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar citas')
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const clientName = `${apt.client.firstName} ${apt.client.lastName}`.toLowerCase()
        const serviceName = apt.service.name.toLowerCase()
        const professionalName = `${apt.user.firstName} ${apt.user.lastName}`.toLowerCase()
        const search = searchTerm.toLowerCase()

        return clientName.includes(search) || 
               serviceName.includes(search) || 
               professionalName.includes(search)
      })
    }

    // Filtrar por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }

  const handleCreateAppointment = () => {
    setSelectedAppointment(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('¿Está seguro de que desea cancelar esta cita?')) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Cita cancelada exitosamente')
        loadAppointments()
      } else {
        throw new Error(result.error || 'Error al cancelar cita')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar cita')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Gestión de Citas
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las citas de tu negocio
          </p>
        </div>
        <Button onClick={handleCreateAppointment}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente, servicio o profesional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="COMPLETED">Completada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  <SelectItem value="NO_SHOW">No Asistió</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando citas...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay citas
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'No se encontraron citas con los filtros aplicados'
                  : 'Comienza creando tu primera cita'}
              </p>
              {!searchTerm && statusFilter === 'ALL' && (
                <Button onClick={handleCreateAppointment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Profesional</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatDate(appointment.startTime)}</p>
                          <p className="text-sm text-gray-600">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {appointment.client.firstName} {appointment.client.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{appointment.client.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.service.name}</p>
                          <p className="text-sm text-gray-600">
                            {appointment.service.duration} min - ${appointment.service.price}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.user.firstName} {appointment.user.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[appointment.status]}>
                          {statusLabels[appointment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            Editar
                          </Button>
                          {appointment.status !== 'CANCELLED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
        mode={modalMode}
        onSuccess={loadAppointments}
      />
    </div>
  )
}
