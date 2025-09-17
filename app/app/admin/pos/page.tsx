
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Plus, 
  Minus,
  CreditCard,
  DollarSign,
  Calculator,
  User,
  Package,
  Trash2,
  Receipt
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const mockServices = [
  { id: 1, name: 'Corte de Cabello', price: 350, category: 'Cabello' },
  { id: 2, name: 'Peinado', price: 250, category: 'Cabello' },
  { id: 3, name: 'Tinte', price: 800, category: 'Cabello' },
  { id: 4, name: 'Manicure', price: 200, category: 'Uñas' },
  { id: 5, name: 'Pedicure', price: 250, category: 'Uñas' },
  { id: 6, name: 'Facial Básico', price: 450, category: 'Facial' },
  { id: 7, name: 'Masaje Relajante', price: 600, category: 'Masajes' },
  { id: 8, name: 'Depilación Piernas', price: 300, category: 'Depilación' }
]

const mockProducts = [
  { id: 1, name: 'Shampoo Premium', price: 180, stock: 15, category: 'Cuidado Capilar' },
  { id: 2, name: 'Acondicionador', price: 160, stock: 12, category: 'Cuidado Capilar' },
  { id: 3, name: 'Esmalte Rojo', price: 85, stock: 25, category: 'Uñas' },
  { id: 4, name: 'Lima para Uñas', price: 45, stock: 30, category: 'Uñas' },
  { id: 5, name: 'Crema Facial', price: 350, stock: 8, category: 'Facial' },
  { id: 6, name: 'Aceite de Masaje', price: 280, stock: 10, category: 'Masajes' }
]

const paymentMethods = [
  { id: 'cash', name: 'Efectivo', icon: DollarSign },
  { id: 'card', name: 'Tarjeta', icon: CreditCard },
  { id: 'transfer', name: 'Transferencia', icon: CreditCard }
]

interface CartItem {
  id: string
  type: 'service' | 'product'
  name: string
  price: number
  quantity: number
  professional?: string
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [discount, setDiscount] = useState(0)
  const [activeTab, setActiveTab] = useState('services')

  const addToCart = (item: any, type: 'service' | 'product') => {
    const cartItem: CartItem = {
      id: `${type}-${item.id}`,
      type,
      name: item.name,
      price: item.price,
      quantity: 1,
      professional: type === 'service' ? 'Ana López' : undefined
    }

    const existingItem = cart.find(c => c.id === cartItem.id)
    if (existingItem) {
      updateQuantity(cartItem.id, existingItem.quantity + 1)
    } else {
      setCart([...cart, cartItem])
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const handleCheckout = () => {
    if (!selectedClient || !paymentMethod || cart.length === 0) {
      alert('Por favor complete toda la información requerida')
      return
    }
    
    // Aquí iría la lógica de procesamiento del pago
    alert('Venta procesada exitosamente')
    setCart([])
    setSelectedClient('')
    setPaymentMethod('')
    setDiscount(0)
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6">
      {/* Panel izquierdo - Productos/Servicios */}
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Punto de Venta</h1>
          <p className="text-muted-foreground">
            Registra ventas de servicios y productos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'services' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('services')}
            className="flex-1"
          >
            Servicios
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('products')}
            className="flex-1"
          >
            Productos
          </Button>
        </div>

        {/* Lista de servicios/productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
          {activeTab === 'services' ? (
            mockServices.map((service) => (
              <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{service.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(service.price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => addToCart(service, 'service')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            mockProducts.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{product.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Stock: {product.stock}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(product, 'product')}
                    disabled={product.stock === 0}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Panel derecho - Carrito y checkout */}
      <div className="w-96 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrito de Venta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selección de cliente */}
            <div>
              <label className="text-sm font-medium mb-2 block">Cliente</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maria">María González</SelectItem>
                  <SelectItem value="carlos">Carlos Ruiz</SelectItem>
                  <SelectItem value="sofia">Sofia Martínez</SelectItem>
                  <SelectItem value="walkIn">Cliente de mostrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Items del carrito */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2" />
                  <p>Carrito vacío</p>
                  <p className="text-xs">Agrega servicios o productos</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      {item.professional && (
                        <p className="text-xs text-muted-foreground">
                          {item.professional}
                        </p>
                      )}
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="mx-2 text-sm w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Separator />

            {/* Descuento */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium w-20">Descuento:</label>
              <Input
                type="number"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-16 text-center"
                min="0"
                max="100"
              />
              <span className="text-sm">%</span>
            </div>

            {/* Totales */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Descuento ({discount}%):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <label className="text-sm font-medium mb-2 block">Método de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod(method.id)}
                      className="flex flex-col h-16"
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{method.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Botón de cobro */}
            <Button
              className="w-full h-12"
              onClick={handleCheckout}
              disabled={cart.length === 0 || !selectedClient || !paymentMethod}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Procesar Venta - {formatCurrency(total)}
            </Button>
          </CardContent>
        </Card>

        {/* Estadísticas rápidas del día */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventas del Día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Transacciones:</span>
              <span className="font-medium">15</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total servicios:</span>
              <span className="font-medium">{formatCurrency(8750)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total productos:</span>
              <span className="font-medium">{formatCurrency(2340)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total del día:</span>
              <span>{formatCurrency(11090)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
