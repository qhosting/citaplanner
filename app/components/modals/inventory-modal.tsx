
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
import { Package, Save, X, DollarSign, Hash, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
  product?: any
  mode: 'create' | 'edit' | 'restock'
}

const productCategories = [
  'Cuidado Capilar',
  'Uñas',
  'Facial',
  'Corporal',
  'Herramientas',
  'Accesorios',
  'Otros'
]

const mockSuppliers = [
  'Beauty Products SA',
  'Nail Art Supplies',
  'Skincare Pro',
  'Professional Tools Co.',
  'Beauty Wholesale'
]

export function InventoryModal({ isOpen, onClose, product, mode }: InventoryModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: product ? {
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || 'Otros',
      supplier: product.supplier || '',
      description: product.description || '',
      price: product.price || 0,
      cost: product.cost || 0,
      stock: product.stock || 0,
      minStock: product.minStock || 5,
      newStock: 0, // Para restocking
      isActive: product.isActive !== false
    } : {
      name: '',
      sku: '',
      category: 'Otros',
      supplier: '',
      description: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
      newStock: 0,
      isActive: true
    }
  })

  const currentStock = watch('stock')
  const minStock = watch('minStock')
  const newStock = watch('newStock')
  const price = watch('price')
  const cost = watch('cost')

  const profit = price && cost ? ((price - cost) / price * 100).toFixed(1) : 0

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let message = ''
      if (mode === 'create') {
        message = 'Producto creado exitosamente'
      } else if (mode === 'edit') {
        message = 'Producto actualizado exitosamente'
      } else if (mode === 'restock') {
        message = `Stock actualizado: +${newStock} unidades`
      }

      console.log('Product data:', data)
      
      toast.success(message)
      onClose()
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSKU = () => {
    const category = watch('category')
    const name = watch('name')
    const timestamp = Date.now().toString().slice(-4)
    
    const categoryCode = category.substring(0, 2).toUpperCase()
    const nameCode = name ? name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'PRD'
    const sku = `${categoryCode}${nameCode}${timestamp}`
    
    setValue('sku', sku)
    toast.success('SKU generado automáticamente')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {mode === 'create' && 'Nuevo Producto'}
            {mode === 'edit' && 'Editar Producto'}
            {mode === 'restock' && 'Reabastecer Inventario'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Agregue un nuevo producto al inventario'}
            {mode === 'edit' && 'Modifique la información del producto'}
            {mode === 'restock' && 'Actualice el stock del producto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {mode === 'restock' ? (
            // Modo restock - Solo mostrar campos relevantes
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">{product?.name}</h4>
                <div className="grid gap-2 text-sm text-blue-700 md:grid-cols-2">
                  <div>Stock actual: {currentStock} unidades</div>
                  <div>Stock mínimo: {minStock} unidades</div>
                  <div>SKU: {product?.sku}</div>
                  <div>Proveedor: {product?.supplier}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newStock">Cantidad a agregar</Label>
                <Input
                  id="newStock"
                  type="number"
                  min="1"
                  {...register('newStock', { 
                    required: 'Cantidad es requerida',
                    min: { value: 1, message: 'Debe ser al menos 1' }
                  })}
                  placeholder="0"
                />
                {errors.newStock && <p className="text-sm text-red-500">{String(errors.newStock.message)}</p>}
                {Number(newStock) > 0 && (
                  <p className="text-sm text-green-600">
                    Nuevo stock total: {Number(currentStock) + Number(newStock)} unidades
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Select value={watch('supplier')} onValueChange={(value) => setValue('supplier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSuppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            // Modo create/edit - Formulario completo
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  {...register('name', { 
                    required: 'Nombre es requerido',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                  })}
                  placeholder="Ej: Shampoo Premium 500ml"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">
                  <Hash className="h-4 w-4 inline mr-1" />
                  SKU
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="sku"
                    {...register('sku', { 
                      required: 'SKU es requerido',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                    })}
                    placeholder="Ej: SH001"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSKU}
                    disabled={!watch('name') || !watch('category')}
                  >
                    Generar
                  </Button>
                </div>
                {errors.sku && <p className="text-sm text-red-500">{errors.sku.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Select value={watch('supplier')} onValueChange={(value) => setValue('supplier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSuppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Costo</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('cost', { 
                    required: 'Costo es requerido',
                    min: { value: 0, message: 'Costo no puede ser negativo' }
                  })}
                />
                {errors.cost && <p className="text-sm text-red-500">{errors.cost.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Precio de Venta
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
                {Number(profit) > 0 && (
                  <p className="text-xs text-green-600">
                    Margen de ganancia: {profit}%
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  {...register('stock', { 
                    required: 'Stock es requerido',
                    min: { value: 0, message: 'Stock no puede ser negativo' }
                  })}
                />
                {errors.stock && <p className="text-sm text-red-500">{errors.stock.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Stock Mínimo
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  min="1"
                  {...register('minStock', { 
                    required: 'Stock mínimo es requerido',
                    min: { value: 1, message: 'Debe ser al menos 1' }
                  })}
                />
                {errors.minStock && <p className="text-sm text-red-500">{errors.minStock.message as string}</p>}
                {currentStock < minStock && currentStock > 0 && (
                  <p className="text-xs text-yellow-600">
                    ⚠️ Stock actual está por debajo del mínimo
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descripción del producto..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg md:col-span-2">
                <div>
                  <p className="font-medium">Producto Activo</p>
                  <p className="text-sm text-muted-foreground">
                    Los productos inactivos no aparecen en el POS
                  </p>
                </div>
                <Switch
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
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
              {isLoading ? 'Guardando...' : (
                mode === 'create' ? 'Crear Producto' :
                mode === 'edit' ? 'Actualizar Producto' : 
                'Actualizar Stock'
              )}
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
