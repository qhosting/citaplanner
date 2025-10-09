
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProductModal } from '@/components/modals/product-modal'
import { toast } from 'react-hot-toast'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const result = await response.json()
      
      if (result.success) {
        setProduct(result.data)
        setIsModalOpen(true)
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

  const handleSuccess = () => {
    router.push(`/dashboard/inventory/products/${params.id}`)
  }

  const handleClose = () => {
    router.push(`/dashboard/inventory/products/${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/inventory/products/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Producto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Modifique la información del producto.
          </p>
        </CardContent>
      </Card>

      {product && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={handleClose}
          product={product}
          mode="edit"
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
