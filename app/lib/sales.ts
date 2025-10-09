
// Phase 3: Sales Module Types

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  type: 'SALE' | 'INTERNAL';
  unit: 'PIECE' | 'SERVICE';
  stock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  isActive: boolean;
  tenantId: string;
  supplierId?: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
  supplier?: Supplier;
  category?: ProductCategory;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  saleNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  saleDate: Date;
  notes?: string;
  tenantId: string;
  clientId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  client?: any;
  user?: any;
  saleItems?: SaleItem[];
}

export interface SaleItem {
  id: string;
  itemType: 'SERVICE' | 'PRODUCT';
  quantity: number;
  unitPrice: number;
  subtotal: number;
  commissionRate?: number;
  commissionAmount?: number;
  saleId: string;
  serviceId?: string;
  productId?: string;
  professionalId?: string;
  createdAt: Date;
  updatedAt: Date;
  service?: any;
  product?: Product;
  professional?: any;
}

export interface InventoryMovement {
  id: string;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  reference?: string;
  tenantId: string;
  productId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  user?: any;
}

export interface ProfessionalCommission {
  id: string;
  period: string;
  totalSales: number;
  totalCommissions: number;
  status: 'PENDING' | 'PAID';
  paidDate?: Date;
  notes?: string;
  tenantId: string;
  professionalId: string;
  createdAt: Date;
  updatedAt: Date;
  professional?: any;
}

export interface SalesReport {
  summary: {
    totalSales: number;
    totalDiscount: number;
    totalTax: number;
    salesCount: number;
    averageSale: number;
  };
  groupedData: Array<{
    period: string;
    total: number;
    count: number;
  }>;
  sales: Sale[];
}

export interface DashboardMetrics {
  period: string;
  salesSummary: {
    totalSales: number;
    salesCount: number;
    averageSale: number;
  };
  salesTrend: Array<{
    period: string;
    total: number;
    count: number;
  }>;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
    salesCount: number;
  }>;
  topServices: Array<{
    service: any;
    quantity: number;
    revenue: number;
    salesCount: number;
    totalCommissions: number;
  }>;
  lowStockAlerts: number;
  lowStockProducts: Product[];
  pendingCommissions: {
    count: number;
    total: number;
    items: ProfessionalCommission[];
  };
}
