
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AppointmentModal } from '@/components/modals/appointment-modal'
import { toast } from 'react-hot-toast'

const mockAppointments = [
  {
    id: 1,
    time: '09:00',
    client: 'María González',
    service: 'Corte de Cabello',
    professional: 'Ana López',
    duration: 60,
    status: 'confirmed',
    phone: '+52 55 1234 5678'
  },
  {
    id: 2,
    time: '10:30',
    client: 'Carlos Ruiz',
    service: 'Barba y Bigote',
    professional: 'Juan Pérez',
    duration: 45,
    status: 'pending',
    phone: '+52 55 9876 5432'
  },
  {
    id: 3,
    time: '12:00',
    client: 'Sofia Martínez',
    service: 'Manicure',
    professional: 'Laura García',
    duration: 90,
    status: 'completed',
    phone: '+52 55 5555 1111'
  },
  {
    id: 4,
    time: '14:30',
    client: 'Diego Hernández',
    service: 'Masaje Relajante',
    professional: 'Carlos Medina',
    duration: 60,
    status: 'no_show',
    phone: '+52 55 3333 7777'
  },
  {
    id: 5,
    time: '16:00',
    client: 'Patricia Vega',
    service: 'Facial Hidratante',
    professional: 'Ana López',
    duration: 75,
    status: 'cancelled',
    phone: '+52 55 8888 2222'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'no_show':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmada'
    case 'pending':
      return 'Pendiente'
    case 'completed':
      return 'Completada'
    case 'cancelled':
      return 'Cancelada'
    case 'no_show':
      return 'No Asistió'
    default:
      return status
  }
}

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('day')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean
    mode: 'create' | 'edit'
    appointment?: any
  }>({
    isOpen: false,
    mode: 'create',
    appointment: null
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.professional.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const openAppointmentModal = (mode: 'create' | 'edit', appointment?: any) => {
    setAppointmentModal({
      isOpen: true,
      mode,
      appointment
    })
  }

  const closeAppointmentModal = () => {
    setAppointmentModal({
      isOpen: false,
      mode: 'create',
      appointment: null
    })
  }

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success(`Cita actualizada a ${getStatusText(newStatus)}`)
      // Aquí normalmente actualizarías el estado local o refrescarías los datos
    } catch (error) {
      toast.error('Error al actualizar la cita')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda y Citas</h1>
          <p className="text-muted-foreground">
            Gestiona todas las citas de tu negocio
          </p>
        </div>
        <Button onClick={() => openAppointmentModal('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Vista y Navegación de Fecha */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(newDate.getDate() - 1)
              setSelectedDate(newDate)
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {formatDate(selectedDate)}
            </h2>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(newDate.getDate() + 1)
              setSelectedDate(newDate)
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Día
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Mes
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, servicio o profesional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
            <SelectItem value="no_show">No Asistió</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Citas */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay citas</h3>
              <p className="text-muted-foreground text-center">
                No se encontraron citas que coincidan con los filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-sm font-medium">{appointment.time}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{appointment.client}</h3>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Servicio:</strong> {appointment.service}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Profesional:</strong> {appointment.professional}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Duración:</strong> {appointment.duration} min
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Teléfono:</strong> {appointment.phone}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openAppointmentModal('edit', appointment)}
                    >
                      Editar
                    </Button>
                    {appointment.status === 'pending' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                      >
                        Confirmar
                      </Button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(appointment.id, 'completed')}
                      >
                        Completar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAppointments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockAppointments.filter(a => a.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockAppointments.filter(a => a.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mockAppointments.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Citas */}
      <AppointmentModal
        isOpen={appointmentModal.isOpen}
        onClose={closeAppointmentModal}
        mode={appointmentModal.mode}
        appointment={appointmentModal.appointment}
      />
    </div>
  )
}
