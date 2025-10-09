
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProductModal } from '@/components/modals/product-modal'

export default function NewProductPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(true)

  const handleSuccess = () => {
    router.push('/dashboard/inventory/products')
  }

  const handleClose = () => {
    router.push('/dashboard/inventory/products')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/inventory/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Complete el formulario para agregar un nuevo producto al inventario.
          </p>
        </CardContent>
      </Card>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleClose}
        mode="create"
        onSuccess={handleSuccess}
      />
    </div>
  )
}
