
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products?isActive=true');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load products');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (product: any) => {
    if (product.stock <= 0) return { label: 'Sin Stock', variant: 'destructive' as const };
    if (product.stock <= product.minStock) return { label: 'Stock Bajo', variant: 'warning' as const };
    return { label: 'En Stock', variant: 'success' as const };
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Button asChild>
          <Link href="/dashboard/inventory/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product);
            return (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.sku && (
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      )}
                    </div>
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Stock:</span>
                      <span className="font-semibold">
                        {product.stock} {product.unit === 'PIECE' ? 'pcs' : 'units'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Min Stock:</span>
                      <span>{product.minStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Costo:</span>
                      <span>${product.costPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Precio Venta:</span>
                      <span className="font-semibold">${product.salePrice.toFixed(2)}</span>
                    </div>
                    {product.category && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Categoría:</span>
                        <span className="text-sm">{product.category.name}</span>
                      </div>
                    )}
                    {product.stock <= product.minStock && (
                      <div className="flex items-center gap-2 text-amber-600 text-sm pt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Reabastecimiento necesario</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/inventory/products/${product.id}`}>Ver</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/inventory/products/${product.id}/edit`}>Editar</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron productos</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
