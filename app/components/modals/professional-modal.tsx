
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, X, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface ProfessionalModalProps {
  isOpen: boolean
  onClose: () => void
  professional?: any
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function ProfessionalModal({ isOpen, onClose, professional, mode, onSuccess }: ProfessionalModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      avatar: '',
      branchId: '',
      isActive: true
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (professional && mode === 'edit') {
        reset({
          email: professional.email || '',
          firstName: professional.firstName || '',
          lastName: professional.lastName || '',
          phone: professional.phone || '',
          avatar: professional.avatar || '',
          branchId: professional.branchId || '',
          isActive: professional.isActive !== false
        })
      } else {
        reset({
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          avatar: '',
          branchId: '',
          isActive: true
        })
      }
      loadBranches()
    }
  }, [isOpen, professional, mode, reset])

  const loadBranches = async () => {
    try {
      const response = await fetch('/api/branches')
      const result = await response.json()
      
      if (result.success) {
        setBranches(result.data || [])
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error)
    }
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const url = mode === 'create' 
        ? '/api/professionals'
        : `/api/professionals/${professional.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          branchId: data.branchId || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          mode === 'create' 
            ? '✅ Profesional creado exitosamente' 
            : '✅ Profesional actualizado exitosamente'
        )
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Error al guardar el profesional')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar el profesional')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {mode === 'create' ? 'Nuevo Profesional' : 'Editar Profesional'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Completa los datos para crear un nuevo profesional'
              : 'Actualiza la información del profesional'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                {...register('firstName', { required: 'El nombre es requerido' })}
                placeholder="Ej: Juan"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Apellido <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...register('lastName', { required: 'El apellido es requerido' })}
                placeholder="Ej: Pérez"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              placeholder="profesional@ejemplo.com"
              disabled={mode === 'edit'}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Ej: +52 123 456 7890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchId">Sucursal</Label>
            <Select
              value={watch('branchId')}
              onValueChange={(value) => setValue('branchId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sucursal (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin sucursal asignada</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">URL de Foto (opcional)</Label>
            <Input
              id="avatar"
              {...register('avatar')}
              placeholder="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
            />
          </div>

          {mode === 'edit' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Profesional activo
              </Label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
