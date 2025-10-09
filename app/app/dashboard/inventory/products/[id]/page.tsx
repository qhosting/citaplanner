
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const result = await response.json()
      
      if (result.success) {
        setProduct(result.data)
      } else {
        throw new Error(result.error || 'Error al cargar producto')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar producto')
      router.push('/dashboard/inventory/products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de que desea eliminar este producto?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Producto eliminado exitosamente')
        router.push('/dashboard/inventory/products')
      } else {
        throw new Error(result.error || 'Error al eliminar producto')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar producto')
    }
  }

  const getStockStatus = () => {
    if (!product) return { label: 'Cargando...', variant: 'secondary' as const }
    if (product.stock <= 0) return { label: 'Sin Stock', variant: 'destructive' as const }
    if (product.stock <= product.minStock) return { label: 'Stock Bajo', variant: 'warning' as const }
    return { label: 'En Stock', variant: 'success' as const }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Cargando...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Producto no encontrado</div>
      </div>
    )
  }

  const stockStatus = getStockStatus()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard/inventory/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/inventory/products/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{product.name}</CardTitle>
              <Badge variant={stockStatus.variant}>
                {stockStatus.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.description && (
              <div>
                <h3 className="font-semibold mb-1">Descripción</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {product.sku && (
              <div>
                <h3 className="font-semibold mb-1">SKU</h3>
                <p className="text-muted-foreground">{product.sku}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Tipo</h3>
                <p className="text-muted-foreground">
                  {product.type === 'PRODUCT' ? 'Producto' : 'Insumo'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Unidad</h3>
                <p className="text-muted-foreground">
                  {product.unit === 'PIECE' ? 'Pieza' : product.unit}
                </p>
              </div>
            </div>

            {product.category && (
              <div>
                <h3 className="font-semibold mb-1">Categoría</h3>
                <p className="text-muted-foreground">{product.category.name}</p>
              </div>
            )}

            {product.supplier && (
              <div>
                <h3 className="font-semibold mb-1">Proveedor</h3>
                <p className="text-muted-foreground">{product.supplier.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Stock Actual</h3>
                <p className="text-2xl font-bold">{product.stock}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Stock Mínimo</h3>
                <p className="text-2xl font-bold">{product.minStock}</p>
              </div>
            </div>

            {product.stock <= product.minStock && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Reabastecimiento necesario</span>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Precios</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio de Costo:</span>
                  <span className="font-semibold">${product.costPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio de Venta:</span>
                  <span className="font-semibold text-lg">${product.salePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Margen:</span>
                  <span className="font-semibold text-green-600">
                    {(((product.salePrice - product.costPrice) / product.costPrice) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Valor en Inventario:</span>
                <span className="font-semibold text-foreground">
                  ${(product.stock * product.costPrice).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
