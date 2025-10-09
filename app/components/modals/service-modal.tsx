
'use client'

import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Scissors, Save, X, Clock, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service?: any
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function ServiceModal({ isOpen, onClose, service, mode, onSuccess }: ServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      duration: 60,
      price: 0,
      categoryId: '',
      color: '#3B82F6',
      isActive: true,
    }
  })

  // Reset form when service changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (service && mode === 'edit') {
        reset({
          name: service.name || '',
          description: service.description || '',
          duration: service.duration || 60,
          price: service.price || 0,
          categoryId: service.categoryId || '',
          color: service.color || '#3B82F6',
          isActive: service.isActive !== undefined ? service.isActive : true,
        })
      } else {
        reset({
          name: '',
          description: '',
          duration: 60,
          price: 0,
          categoryId: '',
          color: '#3B82F6',
          isActive: true,
        })
      }
      loadCategories()
    }
  }, [isOpen, service, mode, reset])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/services/categories')
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const serviceData = {
        name: data.name,
        description: data.description || null,
        duration: parseInt(data.duration),
        price: parseFloat(data.price),
        categoryId: data.categoryId || null,
        color: data.color,
        isActive: data.isActive,
      }

      const url = mode === 'create' 
        ? '/api/services'
        : `/api/services/${service.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al guardar el servicio')
      }
      
      toast.success(mode === 'create' ? 'Servicio creado exitosamente' : 'Servicio actualizado exitosamente')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el servicio')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Scissors className="h-5 w-5 mr-2" />
            {mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Complete la información para crear un nuevo servicio'
              : 'Modifique los detalles del servicio'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre del Servicio *</Label>
              <Input
                id="name"
                placeholder="Ej: Corte de Cabello"
                {...register('name', { required: 'Nombre es requerido' })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del servicio..."
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duración (minutos) *
              </Label>
              <Input
                id="duration"
                type="number"
                min="5"
                step="5"
                placeholder="60"
                {...register('duration', { 
                  required: 'Duración es requerida',
                  min: { value: 5, message: 'Mínimo 5 minutos' }
                })}
              />
              {errors.duration && <p className="text-sm text-red-500">{errors.duration.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('price', { 
                  required: 'Precio es requerido',
                  min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
                })}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría</Label>
              <Select value={watch('categoryId')} onValueChange={(value) => setValue('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  {...register('color')}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={watch('color')}
                  onChange={(e) => setValue('color', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Estado del Servicio</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                  <span className="text-sm text-gray-600">
                    {watch('isActive') ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Vista Previa</h4>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: watch('color') }}
              />
              <div>
                <p className="font-medium">{watch('name') || 'Nombre del servicio'}</p>
                <p className="text-sm text-gray-600">
                  {watch('duration')} min - ${parseFloat(watch('price') || '0').toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Servicio' : 'Actualizar Servicio'}
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
