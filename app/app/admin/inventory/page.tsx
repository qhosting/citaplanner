
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InventoryModal } from '@/components/modals/inventory-modal'
import { toast } from 'react-hot-toast'

const mockProducts = [
  {
    id: 1,
    name: 'Shampoo Premium',
    sku: 'SH001',
    price: 180,
    stock: 15,
    minStock: 5,
    category: 'Cuidado Capilar',
    supplier: 'Beauty Products SA',
    lastRestocked: '2024-09-01',
    status: 'in_stock'
  },
  {
    id: 2,
    name: 'Acondicionador Nutritivo',
    sku: 'AC001',
    price: 160,
    stock: 3,
    minStock: 5,
    category: 'Cuidado Capilar',
    supplier: 'Beauty Products SA',
    lastRestocked: '2024-08-15',
    status: 'low_stock'
  },
  {
    id: 3,
    name: 'Esmalte Rojo Pasión',
    sku: 'ES001',
    price: 85,
    stock: 25,
    minStock: 10,
    category: 'Uñas',
    supplier: 'Nail Art Supplies',
    lastRestocked: '2024-09-10',
    status: 'in_stock'
  },
  {
    id: 4,
    name: 'Lima para Uñas Profesional',
    sku: 'LM001',
    price: 45,
    stock: 0,
    minStock: 15,
    category: 'Uñas',
    supplier: 'Nail Art Supplies',
    lastRestocked: '2024-08-01',
    status: 'out_of_stock'
  },
  {
    id: 5,
    name: 'Crema Facial Hidratante',
    sku: 'CF001',
    price: 350,
    stock: 8,
    minStock: 5,
    category: 'Facial',
    supplier: 'Skincare Pro',
    lastRestocked: '2024-09-05',
    status: 'in_stock'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_stock':
      return 'bg-green-100 text-green-800'
    case 'low_stock':
      return 'bg-yellow-100 text-yellow-800'
    case 'out_of_stock':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'in_stock':
      return 'En Stock'
    case 'low_stock':
      return 'Stock Bajo'
    case 'out_of_stock':
      return 'Sin Stock'
    default:
      return status
  }
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [inventoryModal, setInventoryModal] = useState<{
    isOpen: boolean
    mode: 'create' | 'edit' | 'restock'
    product?: any
  }>({
    isOpen: false,
    mode: 'create',
    product: null
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const openInventoryModal = (mode: 'create' | 'edit' | 'restock', product?: any) => {
    setInventoryModal({
      isOpen: true,
      mode,
      product
    })
  }

  const closeInventoryModal = () => {
    setInventoryModal({
      isOpen: false,
      mode: 'create',
      product: null
    })
  }

  const handleRestock = (productId: number) => {
    const product = mockProducts.find(p => p.id === productId)
    if (product) {
      openInventoryModal('restock', product)
    }
  }

  const totalValue = mockProducts.reduce((sum, product) => sum + (product.price * product.stock), 0)
  const lowStockCount = mockProducts.filter(p => p.status === 'low_stock').length
  const outOfStockCount = mockProducts.filter(p => p.status === 'out_of_stock').length
  const totalProducts = mockProducts.length

  const handleDeleteProduct = (productId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      toast.success('Producto eliminado exitosamente')
      // Aquí iría la lógica para eliminar el producto
    }
  }

  const handleBulkRestock = () => {
    const lowStockProducts = mockProducts.filter(p => p.status === 'low_stock')
    if (lowStockProducts.length === 0) {
      toast('No hay productos con stock bajo')
      return
    }
    
    toast(`${lowStockProducts.length} productos necesitan reabastecimiento`)
    // Implementar lógica de reabastecimiento masivo
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona el stock de productos y materiales
          </p>
        </div>
        <div className="flex gap-2">
          {lowStockCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBulkRestock}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Rebastecer ({lowStockCount})
            </Button>
          )}
          <Button onClick={() => openInventoryModal('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Items únicos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% este mes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Productos por reabastecer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Productos agotados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Atención: {lowStockCount + outOfStockCount} productos necesitan reabastecimiento
                </p>
                <p className="text-sm text-yellow-700">
                  {lowStockCount} productos con stock bajo y {outOfStockCount} productos sin stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="Cuidado Capilar">Cuidado Capilar</SelectItem>
            <SelectItem value="Uñas">Uñas</SelectItem>
            <SelectItem value="Facial">Facial</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="in_stock">En Stock</SelectItem>
            <SelectItem value="low_stock">Stock Bajo</SelectItem>
            <SelectItem value="out_of_stock">Sin Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de productos */}
      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
              <p className="text-muted-foreground text-center">
                No se encontraron productos que coincidan con los filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <Badge className={getStatusColor(product.status)}>
                          {getStatusText(product.status)}
                        </Badge>
                        <Badge variant="outline">
                          {product.category}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p><strong>SKU:</strong> {product.sku}</p>
                          <p><strong>Precio:</strong> {formatCurrency(product.price)}</p>
                        </div>
                        <div>
                          <p><strong>Stock actual:</strong> {product.stock} unidades</p>
                          <p><strong>Stock mínimo:</strong> {product.minStock} unidades</p>
                        </div>
                        <div>
                          <p><strong>Proveedor:</strong> {product.supplier}</p>
                          <p><strong>Último restock:</strong> {formatDate(product.lastRestocked)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <strong>Valor en stock:</strong> {formatCurrency(product.price * product.stock)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openInventoryModal('edit', product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRestock(product.id)}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Reabastecer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Inventario */}
      <InventoryModal
        isOpen={inventoryModal.isOpen}
        onClose={closeInventoryModal}
        mode={inventoryModal.mode}
        product={inventoryModal.product}
      />
    </div>
  )
}
