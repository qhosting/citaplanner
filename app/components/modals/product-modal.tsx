
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
import { Package, Save, X, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: any
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function ProductModal({ isOpen, onClose, product, mode, onSuccess }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      type: 'PRODUCT',
      unit: 'PIECE',
      stock: 0,
      minStock: 0,
      costPrice: 0,
      salePrice: 0,
      categoryId: '',
      supplierId: '',
      isActive: true,
    }
  })

  // Reset form when product changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (product && mode === 'edit') {
        reset({
          name: product.name || '',
          description: product.description || '',
          sku: product.sku || '',
          type: product.type || 'PRODUCT',
          unit: product.unit || 'PIECE',
          stock: product.stock || 0,
          minStock: product.minStock || 0,
          costPrice: product.costPrice || 0,
          salePrice: product.salePrice || 0,
          categoryId: product.categoryId || '',
          supplierId: product.supplierId || '',
          isActive: product.isActive !== undefined ? product.isActive : true,
        })
      } else {
        reset({
          name: '',
          description: '',
          sku: '',
          type: 'PRODUCT',
          unit: 'PIECE',
          stock: 0,
          minStock: 0,
          costPrice: 0,
          salePrice: 0,
          categoryId: '',
          supplierId: '',
          isActive: true,
        })
      }
      loadData()
    }
  }, [isOpen, product, mode, reset])

  const loadData = async () => {
    try {
      const [categoriesRes, suppliersRes] = await Promise.all([
        fetch('/api/inventory/categories'),
        fetch('/api/inventory/suppliers'),
      ])

      const [categoriesData, suppliersData] = await Promise.all([
        categoriesRes.json(),
        suppliersRes.json(),
      ])

      setCategories(categoriesData.success ? categoriesData.data : [])
      setSuppliers(suppliersData.success ? suppliersData.data : [])
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const productData = {
        name: data.name,
        description: data.description || null,
        sku: data.sku || null,
        type: data.type,
        unit: data.unit,
        stock: parseFloat(data.stock),
        minStock: parseFloat(data.minStock),
        costPrice: parseFloat(data.costPrice),
        salePrice: parseFloat(data.salePrice),
        categoryId: data.categoryId || null,
        supplierId: data.supplierId || null,
        isActive: data.isActive,
      }

      const url = mode === 'create' 
        ? '/api/products'
        : `/api/products/${product.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al guardar el producto')
      }
      
      toast.success(mode === 'create' ? 'Producto creado exitosamente' : 'Producto actualizado exitosamente')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Complete la información para crear un nuevo producto'
              : 'Modifique los detalles del producto'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                placeholder="Ej: Shampoo Profesional"
                {...register('name', { required: 'Nombre es requerido' })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del producto..."
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Código único del producto"
                {...register('sku')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={watch('type')} onValueChange={(value) => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Producto</SelectItem>
                  <SelectItem value="SUPPLY">Insumo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidad *</Label>
              <Select value={watch('unit')} onValueChange={(value) => setValue('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unidad de medida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIECE">Pieza</SelectItem>
                  <SelectItem value="LITER">Litro</SelectItem>
                  <SelectItem value="KILOGRAM">Kilogramo</SelectItem>
                  <SelectItem value="METER">Metro</SelectItem>
                  <SelectItem value="BOX">Caja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Actual *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                {...register('stock', { 
                  required: 'Stock es requerido',
                  min: { value: 0, message: 'El stock debe ser mayor o igual a 0' }
                })}
              />
              {errors.stock && <p className="text-sm text-red-500">{errors.stock.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo *</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                {...register('minStock', { 
                  required: 'Stock mínimo es requerido',
                  min: { value: 0, message: 'El stock mínimo debe ser mayor o igual a 0' }
                })}
              />
              {errors.minStock && <p className="text-sm text-red-500">{errors.minStock.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio de Costo *
              </Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('costPrice', { 
                  required: 'Precio de costo es requerido',
                  min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
                })}
              />
              {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio de Venta *
              </Label>
              <Input
                id="salePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('salePrice', { 
                  required: 'Precio de venta es requerido',
                  min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
                })}
              />
              {errors.salePrice && <p className="text-sm text-red-500">{errors.salePrice.message as string}</p>}
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
              <Label htmlFor="supplierId">Proveedor</Label>
              <Select value={watch('supplierId')} onValueChange={(value) => setValue('supplierId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin proveedor</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Estado del Producto</Label>
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
            <h4 className="font-medium text-blue-900 mb-2">Resumen</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Producto:</span> {watch('name') || 'Sin nombre'}</p>
              <p><span className="font-medium">Stock:</span> {watch('stock')} {watch('unit')}</p>
              <p><span className="font-medium">Precio Venta:</span> ${parseFloat(watch('salePrice') || '0').toFixed(2)}</p>
              <p><span className="font-medium">Margen:</span> {
                watch('costPrice') && watch('salePrice') 
                  ? `${(((parseFloat(watch('salePrice')) - parseFloat(watch('costPrice'))) / parseFloat(watch('costPrice'))) * 100).toFixed(2)}%`
                  : '0%'
              }</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Producto' : 'Actualizar Producto'}
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
