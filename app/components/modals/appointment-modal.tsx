
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Clock, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment?: any
  mode: 'create' | 'edit'
}

const mockClients = [
  { id: '1', name: 'María González', phone: '+52 55 1234 5678' },
  { id: '2', name: 'Carlos Ruiz', phone: '+52 55 9876 5432' },
  { id: '3', name: 'Sofia Martínez', phone: '+52 55 5555 1111' }
]

const mockServices = [
  { id: '1', name: 'Corte de Cabello', duration: 60, price: 350 },
  { id: '2', name: 'Peinado', duration: 45, price: 250 },
  { id: '3', name: 'Manicure', duration: 90, price: 200 }
]

const mockProfessionals = [
  { id: '1', name: 'Ana López' },
  { id: '2', name: 'Juan Pérez' },
  { id: '3', name: 'Laura García' }
]

export function AppointmentModal({ isOpen, onClose, appointment, mode }: AppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: appointment ? {
      clientId: appointment.clientId || '',
      serviceId: appointment.serviceId || '',
      professionalId: appointment.userId || '',
      date: appointment.startTime ? new Date(appointment.startTime).toISOString().split('T')[0] : '',
      time: appointment.startTime ? new Date(appointment.startTime).toTimeString().slice(0, 5) : '',
      notes: appointment.notes || '',
      status: appointment.status || 'PENDIENTE'
    } : {
      clientId: '',
      serviceId: '',
      professionalId: '',
      date: '',
      time: '',
      notes: '',
      status: 'PENDIENTE'
    }
  })

  const selectedService = mockServices.find(s => s.id === watch('serviceId'))

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const appointmentData = {
        ...data,
        startTime: new Date(`${data.date}T${data.time}`),
        endTime: selectedService ? new Date(new Date(`${data.date}T${data.time}`).getTime() + selectedService.duration * 60000) : null
      }

      console.log('Appointment data:', appointmentData)
      
      toast.success(mode === 'create' ? 'Cita creada exitosamente' : 'Cita actualizada exitosamente')
      onClose()
    } catch (error) {
      toast.error('Error al guardar la cita')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (mode === 'edit' && appointment) {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        toast.success(`Cita marcada como ${newStatus.toLowerCase()}`)
        onClose()
      } catch (error) {
        toast.error('Error al actualizar estado')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {mode === 'create' ? 'Nueva Cita' : 'Editar Cita'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Complete la información para agendar una nueva cita'
              : 'Modifique los detalles de la cita'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select value={watch('clientId')} onValueChange={(value) => setValue('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-sm text-red-500">Cliente es requerido</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceId">Servicio</Label>
              <Select value={watch('serviceId')} onValueChange={(value) => setValue('serviceId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {mockServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.duration}min - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceId && <p className="text-sm text-red-500">Servicio es requerido</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalId">Profesional</Label>
              <Select value={watch('professionalId')} onValueChange={(value) => setValue('professionalId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar profesional" />
                </SelectTrigger>
                <SelectContent>
                  {mockProfessionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.professionalId && <p className="text-sm text-red-500">Profesional es requerido</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de la cita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                  <SelectItem value="COMPLETADA">Completada</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  <SelectItem value="NO_ASISTIÓ">No Asistió</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                {...register('date', { required: 'Fecha es requerida' })}
              />
              {errors.date && <p className="text-sm text-red-500">Fecha es requerida</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                {...register('time', { required: 'Hora es requerida' })}
              />
              {errors.time && <p className="text-sm text-red-500">Hora es requerida</p>}
            </div>
          </div>

          {selectedService && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Duración estimada: {selectedService.duration} minutos
              </p>
              <p className="text-sm text-blue-600">
                Precio: ${selectedService.price}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre la cita..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {mode === 'edit' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStatusChange('CONFIRMADA')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStatusChange('COMPLETADA')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Completar
                </Button>
              </>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Cita' : 'Actualizar Cita'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
