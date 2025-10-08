
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, ShoppingCart } from 'lucide-react';

interface CartItem {
  id: string;
  itemType: 'SERVICE' | 'PRODUCT';
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  serviceId?: string;
  productId?: string;
  professionalId?: string;
  commissionRate?: number;
}

export default function POSPage() {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO'>('EFECTIVO');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, servicesRes, clientsRes, professionalsRes] = await Promise.all([
        fetch('/api/products?isActive=true&type=SALE'),
        fetch('/api/services?isActive=true'),
        fetch('/api/clients?isActive=true'),
        fetch('/api/users?role=PROFESSIONAL'),
      ]);

      setProducts(await productsRes.json());
      setServices(await servicesRes.json());
      setClients(await clientsRes.json());
      setProfessionals(await professionalsRes.json());
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar datos',
        variant: 'destructive',
      });
    }
  };

  const addProductToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      updateCartItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        itemType: 'PRODUCT',
        name: product.name,
        quantity: 1,
        unitPrice: product.salePrice,
        subtotal: product.salePrice,
        productId: product.id,
      };
      setCart([...cart, newItem]);
    }
  };

  const addServiceToCart = (service: any, professionalId: string, commissionRate: number) => {
    const newItem: CartItem = {
      id: `cart-${Date.now()}`,
      itemType: 'SERVICE',
      name: service.name,
      quantity: 1,
      unitPrice: service.price,
      subtotal: service.price,
      serviceId: service.id,
      professionalId,
      commissionRate,
    };
    setCart([...cart, newItem]);
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(cart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          subtotal: item.unitPrice * quantity,
        };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal - discount + tax;
    return { subtotal, total };
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'El carrito está vacío',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({
        itemType: item.itemType,
        serviceId: item.serviceId,
        productId: item.productId,
        professionalId: item.professionalId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        commissionRate: item.commissionRate,
      }));

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient || undefined,
          items,
          discount,
          tax,
          paymentMethod,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Error al crear venta');

      const sale = await response.json();

      toast({
        title: 'Éxito',
        description: `Sale ${sale.saleNumber} completed successfully`,
      });

      // Reset form
      setCart([]);
      setSelectedClient('');
      setDiscount(0);
      setTax(0);
      setNotes('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, total } = calculateTotals();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Punto de Venta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products & Services */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(product => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4"
                    onClick={() => addProductToCart(product)}
                    disabled={product.stock <= 0}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map(service => (
                  <div key={service.id} className="flex items-center gap-4 p-4 border rounded">
                    <div className="flex-1">
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${service.price.toFixed(2)} - {service.duration} min
                      </p>
                    </div>
                    <Select onValueChange={(professionalId) => {
                      const commissionRate = 15; // Default, should come from service config
                      addServiceToCart(service, professionalId, commissionRate);
                    }}>
                      <SelectTrigger className="w-[200px]">
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">El carrito está vacío</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.unitPrice.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value))}
                          className="w-16"
                        />
                        <span className="font-semibold w-20 text-right">
                          ${item.subtotal.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Descuento:</span>
                      <Input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-24 text-right"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Impuesto:</span>
                      <Input
                        type="number"
                        min="0"
                        value={tax}
                        onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                        className="w-24 text-right"
                      />
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Finalizar Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cliente (Opcional)</Label>
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

              <div>
                <Label>Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notas</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={completeSale}
                disabled={loading || cart.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Completar Venta'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
