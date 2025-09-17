
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Save, X, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client?: any
  mode: 'create' | 'edit'
}

export function ClientModal({ isOpen, onClose, client, mode }: ClientModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: client ? {
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      birthday: client.birthday ? client.birthday.split('T')[0] : '',
      notes: client.notes || ''
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      birthday: '',
      notes: ''
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Client data:', data)
      
      toast.success(mode === 'create' ? 'Cliente creado exitosamente' : 'Cliente actualizado exitosamente')
      onClose()
    } catch (error) {
      toast.error('Error al guardar el cliente')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {mode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Complete la información para registrar un nuevo cliente'
              : 'Modifique los datos del cliente'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                {...register('firstName', { 
                  required: 'Nombre es requerido',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                })}
                placeholder="Ingrese el nombre"
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                {...register('lastName', { 
                  required: 'Apellido es requerido',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                })}
                placeholder="Ingrese el apellido"
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="h-4 w-4 inline mr-1" />
                Teléfono
              </Label>
              <Input
                id="phone"
                {...register('phone', { 
                  required: 'Teléfono es requerido',
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Formato de teléfono inválido'
                  }
                })}
                placeholder="+52 55 1234 5678"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message as string}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                <MapPin className="h-4 w-4 inline mr-1" />
                Dirección
              </Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Calle, Número, Colonia, Ciudad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha de Nacimiento
              </Label>
              <Input
                id="birthday"
                type="date"
                {...register('birthday')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre el cliente (alergias, preferencias, etc.)"
              rows={3}
              {...register('notes')}
            />
          </div>

          {mode === 'edit' && client && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Información adicional</h4>
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <div>Total de citas: {client.totalAppointments || 0}</div>
                <div>Total gastado: ${client.totalSpent || 0}</div>
                <div>Cliente desde: {client.createdAt ? new Date(client.createdAt).toLocaleDateString('es-ES') : 'N/A'}</div>
                <div>Última cita: {client.lastAppointment ? new Date(client.lastAppointment).toLocaleDateString('es-ES') : 'N/A'}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Cliente' : 'Actualizar Cliente'}
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
