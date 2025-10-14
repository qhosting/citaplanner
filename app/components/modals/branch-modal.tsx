
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, X, Building } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface BranchModalProps {
  isOpen: boolean
  onClose: () => void
  branch?: any
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function BranchModal({ isOpen, onClose, branch, mode, onSuccess }: BranchModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      isActive: true
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (branch && mode === 'edit') {
        reset({
          name: branch.name || '',
          address: branch.address || '',
          phone: branch.phone || '',
          email: branch.email || '',
          isActive: branch.isActive !== false
        })
      } else {
        reset({
          name: '',
          address: '',
          phone: '',
          email: '',
          isActive: true
        })
      }
    }
  }, [isOpen, branch, mode, reset])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const url = mode === 'create' 
        ? '/api/branches'
        : `/api/branches/${branch.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          mode === 'create' 
            ? '✅ Sucursal creada exitosamente' 
            : '✅ Sucursal actualizada exitosamente'
        )
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Error al guardar la sucursal')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar la sucursal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {mode === 'create' ? 'Nueva Sucursal' : 'Editar Sucursal'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Completa los datos para crear una nueva sucursal'
              : 'Actualiza la información de la sucursal'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre de la Sucursal <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
              placeholder="Ej: Sucursal Centro"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Calle, número, colonia, ciudad"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Ej: +52 123 456 7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                placeholder="sucursal@ejemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
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
                Sucursal activa
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
