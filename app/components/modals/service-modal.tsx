
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
import { Switch } from '@/components/ui/switch'
import { Scissors, Save, X, Clock, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service?: any
  mode: 'create' | 'edit'
}

const serviceCategories = [
  'Cabello',
  'Uñas',
  'Facial',
  'Corporal',
  'Masajes',
  'Depilación',
  'Maquillaje',
  'Otros'
]

const mockProfessionals = [
  { id: '1', name: 'Ana López' },
  { id: '2', name: 'Juan Pérez' },
  { id: '3', name: 'Laura García' },
  { id: '4', name: 'Carlos Medina' }
]

export function ServiceModal({ isOpen, onClose, service, mode }: ServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>(
    service?.professionals || []
  )
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: service ? {
      name: service.name || '',
      description: service.description || '',
      category: service.category || 'Otros',
      duration: service.duration || 30,
      price: service.price || 0,
      commission: service.commission || 10,
      color: service.color || '#3B82F6',
      isActive: service.isActive !== false
    } : {
      name: '',
      description: '',
      category: 'Otros',
      duration: 30,
      price: 0,
      commission: 10,
      color: '#3B82F6',
      isActive: true
    }
  })

  const duration = watch('duration')
  const price = watch('price')

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const serviceData = {
        ...data,
        professionals: selectedProfessionals
      }

      console.log('Service data:', serviceData)
      
      toast.success(mode === 'create' ? 'Servicio creado exitosamente' : 'Servicio actualizado exitosamente')
      onClose()
    } catch (error) {
      toast.error('Error al guardar el servicio')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleProfessional = (professionalId: string) => {
    setSelectedProfessionals(prev => 
      prev.includes(professionalId)
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Scissors className="h-5 w-5 mr-2" />
            {mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Configure un nuevo servicio para su negocio'
              : 'Modifique la configuración del servicio'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre del Servicio</Label>
              <Input
                id="name"
                {...register('name', { 
                  required: 'Nombre es requerido',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                })}
                placeholder="Ej: Corte de Cabello Dama"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color Identificador</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  {...register('color')}
                  className="w-16 h-10 p-1 border-0"
                />
                <Input
                  value={watch('color')}
                  onChange={(e) => setValue('color', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">
                <Clock className="h-4 w-4 inline mr-1" />
                Duración (minutos)
              </Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="480"
                step="5"
                {...register('duration', { 
                  required: 'Duración es requerida',
                  min: { value: 5, message: 'Mínimo 5 minutos' },
                  max: { value: 480, message: 'Máximo 8 horas' }
                })}
              />
              {errors.duration && <p className="text-sm text-red-500">{errors.duration.message as string}</p>}
              {duration && (
                <p className="text-xs text-muted-foreground">
                  Duración: {Math.floor(duration / 60)}h {duration % 60}min
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Precio
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register('price', { 
                  required: 'Precio es requerido',
                  min: { value: 0, message: 'Precio no puede ser negativo' }
                })}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Comisión (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...register('commission', { 
                  min: { value: 0, message: 'Comisión no puede ser negativa' },
                  max: { value: 100, message: 'Comisión no puede ser mayor a 100%' }
                })}
              />
              {errors.commission && <p className="text-sm text-red-500">{errors.commission.message as string}</p>}
              {price && watch('commission') && (
                <p className="text-xs text-muted-foreground">
                  Comisión: ${(price * watch('commission') / 100).toFixed(2)}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción detallada del servicio..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Profesionales que pueden realizar este servicio</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {mockProfessionals.map((prof) => (
                <div key={prof.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`prof-${prof.id}`}
                    checked={selectedProfessionals.includes(prof.id)}
                    onChange={() => toggleProfessional(prof.id)}
                    className="rounded"
                  />
                  <Label htmlFor={`prof-${prof.id}`} className="cursor-pointer">
                    {prof.name}
                  </Label>
                </div>
              ))}
            </div>
            {selectedProfessionals.length === 0 && (
              <p className="text-sm text-yellow-600">
                Seleccione al menos un profesional
              </p>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Servicio Activo</p>
              <p className="text-sm text-muted-foreground">
                Los servicios inactivos no aparecen en reservas
              </p>
            </div>
            <Switch
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || selectedProfessionals.length === 0}
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
