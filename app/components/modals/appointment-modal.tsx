
'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Calendar, Clock, Save, X, Search, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment?: any
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function AppointmentModal({ isOpen, onClose, appointment, mode, onSuccess }: AppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [selectedClientDisplay, setSelectedClientDisplay] = useState('')
  const clientSearchRef = useRef<HTMLDivElement>(null)
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      clientId: '',
      serviceId: '',
      userId: '',
      branchId: '',
      date: '',
      time: '',
      notes: '',
      status: 'PENDING'
    }
  })

  // Click outside handler for client dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter clients based on search term
  useEffect(() => {
    if (!clientSearchTerm.trim()) {
      setFilteredClients(clients)
      return
    }

    const term = clientSearchTerm.toLowerCase()
    const filtered = clients.filter(client => 
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.toLowerCase().includes(term)
    )
    setFilteredClients(filtered)
  }, [clientSearchTerm, clients])

  // Reset form when appointment changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (appointment && mode === 'edit') {
        reset({
          clientId: appointment.clientId || '',
          serviceId: appointment.serviceId || '',
          userId: appointment.userId || '',
          branchId: appointment.branchId || '',
          date: appointment.startTime ? new Date(appointment.startTime).toISOString().split('T')[0] : '',
          time: appointment.startTime ? new Date(appointment.startTime).toTimeString().slice(0, 5) : '',
          notes: appointment.notes || '',
          status: appointment.status || 'PENDING'
        })
        
        // Set client display name for edit mode
        if (appointment.client) {
          setSelectedClientDisplay(`${appointment.client.firstName} ${appointment.client.lastName}`)
        }
      } else {
        reset({
          clientId: '',
          serviceId: '',
          userId: '',
          branchId: '',
          date: '',
          time: '',
          notes: '',
          status: 'PENDING'
        })
        setSelectedClientDisplay('')
        setClientSearchTerm('')
      }
      loadData()
    }
  }, [isOpen, appointment, mode, reset])

  const loadData = async () => {
    try {
      const [clientsRes, servicesRes, professionalsRes, branchesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/services'),
        fetch('/api/professionals'),
        fetch('/api/branches'),
      ])

      // Verificar respuestas HTTP
      if (!clientsRes.ok) {
        console.error('❌ Error al cargar clientes:', clientsRes.status, clientsRes.statusText)
        const errorData = await clientsRes.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('Detalles del error:', errorData)
        toast.error(`Error al cargar clientes: ${errorData.error || clientsRes.statusText}`)
      }

      if (!servicesRes.ok) {
        console.error('❌ Error al cargar servicios:', servicesRes.status, servicesRes.statusText)
      }

      if (!professionalsRes.ok) {
        console.error('❌ Error al cargar profesionales:', professionalsRes.status, professionalsRes.statusText)
      }

      if (!branchesRes.ok) {
        console.error('❌ Error al cargar sucursales:', branchesRes.status, branchesRes.statusText)
      }

      const [clientsData, servicesData, professionalsData, branchesData] = await Promise.all([
        clientsRes.ok ? clientsRes.json() : { success: false, data: [] },
        servicesRes.ok ? servicesRes.json() : { success: false, data: [] },
        professionalsRes.ok ? professionalsRes.json() : { success: false, data: [] },
        branchesRes.ok ? branchesRes.json() : { success: false, data: [] },
      ])

      console.log('📊 Datos cargados:', {
        clientes: clientsData.success ? clientsData.data.length : 0,
        servicios: servicesData.success ? servicesData.data.length : 0,
        profesionales: professionalsData.success ? professionalsData.data.length : 0,
        sucursales: branchesData.success ? branchesData.data.length : 0,
      })

      setClients(clientsData.success ? clientsData.data : [])
      setServices(servicesData.success ? servicesData.data : [])
      setProfessionals(professionalsData.success ? professionalsData.data : [])
      setBranches(branchesData.success ? branchesData.data : [])

      // Mostrar advertencias si faltan datos
      if (!clientsData.success || clientsData.data.length === 0) {
        console.warn('⚠️ No hay clientes disponibles')
        toast.error('No hay clientes disponibles. Por favor, cree un cliente primero.')
      }

      if (!servicesData.success || servicesData.data.length === 0) {
        console.warn('⚠️ No hay servicios disponibles')
      }

      if (!professionalsData.success || professionalsData.data.length === 0) {
        console.warn('⚠️ No hay profesionales disponibles')
      }

      if (!branchesData.success || branchesData.data.length === 0) {
        console.warn('⚠️ No hay sucursales disponibles')
      }

      // Si solo hay una sucursal, seleccionarla automáticamente
      if (branchesData.success && branchesData.data.length === 1 && !appointment) {
        setValue('branchId', branchesData.data[0].id)
      }
    } catch (error) {
      console.error('❌ Error crítico al cargar datos:', error)
      toast.error('Error al cargar datos del formulario')
    }
  }

  const handleClientSelect = (client: any) => {
    setValue('clientId', client.id)
    setSelectedClientDisplay(`${client.firstName} ${client.lastName}`)
    setClientSearchTerm('')
    setShowClientDropdown(false)
  }

  const handleClientSearchFocus = () => {
    setShowClientDropdown(true)
    if (!clientSearchTerm) {
      setFilteredClients(clients)
    }
  }

  const selectedService = services.find(s => s.id === watch('serviceId'))

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const startTime = new Date(`${data.date}T${data.time}`)
      
      const appointmentData = {
        clientId: data.clientId,
        serviceId: data.serviceId,
        userId: data.userId,
        branchId: data.branchId,
        startTime: startTime.toISOString(),
        status: data.status,
        notes: data.notes || null,
      }

      const url = mode === 'create' 
        ? '/api/appointments'
        : `/api/appointments/${appointment.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al guardar la cita')
      }
      
      toast.success(mode === 'create' ? 'Cita creada exitosamente' : 'Cita actualizada exitosamente')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la cita')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (mode === 'edit' && appointment) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/appointments/${appointment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Error al actualizar estado')
        }

        const statusLabels: any = {
          CONFIRMED: 'confirmada',
          COMPLETED: 'completada',
          CANCELLED: 'cancelada',
          NO_SHOW: 'marcada como no asistió',
        }

        toast.success(`Cita ${statusLabels[newStatus] || 'actualizada'}`)
        onSuccess?.()
        onClose()
      } catch (error: any) {
        toast.error(error.message || 'Error al actualizar estado')
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
            {/* Client Search with Autocomplete */}
            <div className="space-y-2 relative" ref={clientSearchRef}>
              <Label htmlFor="clientSearch">
                Cliente * {selectedClientDisplay && <span className="text-green-600 text-sm">✓ {selectedClientDisplay}</span>}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="clientSearch"
                  type="text"
                  placeholder="Buscar cliente por nombre, email o teléfono..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  onFocus={handleClientSearchFocus}
                  className="pl-10"
                />
              </div>
              
              {showClientDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredClients.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No se encontraron clientes</p>
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleClientSelect(client)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {client.email || client.phone || 'Sin contacto'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
              
              {errors.clientId && <p className="text-sm text-red-500">Cliente es requerido</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceId">Servicio *</Label>
              <Select value={watch('serviceId')} onValueChange={(value) => setValue('serviceId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.length === 0 ? (
                    <SelectItem value="no-services" disabled>No hay servicios disponibles</SelectItem>
                  ) : (
                    services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - {service.duration}min - ${service.price}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.serviceId && <p className="text-sm text-red-500">Servicio es requerido</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">Profesional *</Label>
              <Select value={watch('userId')} onValueChange={(value) => setValue('userId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar profesional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.length === 0 ? (
                    <SelectItem value="no-professionals" disabled>No hay profesionales disponibles</SelectItem>
                  ) : (
                    professionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.firstName} {prof.lastName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.userId && <p className="text-sm text-red-500">Profesional es requerido</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchId">Sucursal *</Label>
              <Select value={watch('branchId')} onValueChange={(value) => setValue('branchId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {branches.length === 0 ? (
                    <SelectItem value="no-branches" disabled>No hay sucursales disponibles</SelectItem>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.branchId && <p className="text-sm text-red-500">Sucursal es requerida</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de la cita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="COMPLETED">Completada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  <SelectItem value="NO_SHOW">No Asistió</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                {...register('date', { required: 'Fecha es requerida' })}
              />
              {errors.date && <p className="text-sm text-red-500">Fecha es requerida</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora *</Label>
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
                  onClick={() => handleStatusChange('CONFIRMED')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStatusChange('COMPLETED')}
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
