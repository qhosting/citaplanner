
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'service';
}

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [discount, setDiscount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, servicesRes, clientsRes, professionalsRes] = await Promise.all([
        fetch('/api/products?isActive=true'),
        fetch('/api/services'),
        fetch('/api/users?role=CLIENT'),
        fetch('/api/users?role=STAFF'),
      ]);

      const [productsData, servicesData, clientsData, professionalsData] = await Promise.all([
        productsRes.json(),
        servicesRes.json(),
        clientsRes.json(),
        professionalsRes.json(),
      ]);

      setProducts(productsData.success ? productsData.data : []);
      setServices(servicesData.success ? servicesData.data : []);
      setClients(clientsData.success ? clientsData.data : []);
      setProfessionals(professionalsData.success ? professionalsData.data : []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar datos',
        variant: 'destructive',
      });
    }
  };

  const addProductToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id && item.type === 'product');
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id && item.type === 'product'
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        type: 'product',
      }]);
    }
  };

  const addServiceToCart = (service: any) => {
    const existingItem = cart.find(item => item.id === service.id && item.type === 'service');
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === service.id && item.type === 'service'
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: service.id,
        name: service.name,
        price: service.price,
        quantity: 1,
        type: 'service',
      }]);
    }
  };

  const updateQuantity = (id: string, type: 'product' | 'service', delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id && item.type === type) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string, type: 'product' | 'service') => {
    setCart(cart.filter(item => !(item.id === id && item.type === type)));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - discount;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'El carrito está vacío',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedClient) {
      toast({
        title: 'Error',
        description: 'Seleccione un cliente',
        variant: 'destructive',
      });
      return;
    }

    try {
      const saleData = {
        clientId: selectedClient,
        professionalId: selectedProfessional || undefined,
        paymentMethod,
        discount,
        items: cart.map(item => ({
          productId: item.type === 'product' ? item.id : undefined,
          serviceId: item.type === 'service' ? item.id : undefined,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al procesar la venta');
      }

      toast({
        title: 'Éxito',
        description: `Venta ${result.data.saleNumber} completada exitosamente`,
      });

      // Reset form
      setCart([]);
      setSelectedClient('');
      setSelectedProfessional('');
      setDiscount(0);
      setPaymentMethod('CASH');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al procesar la venta',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Punto de Venta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products and Services */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos y Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="products">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="products">Productos</TabsTrigger>
                  <TabsTrigger value="services">Servicios</TabsTrigger>
                </TabsList>
                
                <TabsContent value="products" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map(product => (
                      <Button
                        key={product.id}
                        variant="outline"
                        className="h-auto flex-col items-start p-4"
                        onClick={() => addProductToCart(product)}
                      >
                        <span className="font-semibold">{product.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ${product.salePrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Stock: {product.stock}
                        </span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {services.map(service => (
                      <Button
                        key={service.id}
                        variant="outline"
                        className="h-auto flex-col items-start p-4"
                        onClick={() => addServiceToCart(service)}
                      >
                        <span className="font-semibold">{service.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ${service.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {service.duration} min
                        </span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.type, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.type, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.id, item.type)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Client Selection */}
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Professional Selection */}
              <div className="space-y-2">
                <Label>Profesional (Opcional)</Label>
                <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map(prof => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.firstName} {prof.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                    <SelectItem value="CARD">Tarjeta</SelectItem>
                    <SelectItem value="TRANSFER">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <Label>Descuento</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={cart.length === 0 || !selectedClient}
              >
                Procesar Venta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
