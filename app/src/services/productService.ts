
import { PrismaClient, ProductType, ProductUnit } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateProductInput {
  name: string;
  description?: string;
  sku?: string;
  type: ProductType;
  unit: ProductUnit;
  stock?: number;
  minStock?: number;
  costPrice?: number;
  salePrice?: number;
  supplierId?: string;
  categoryId?: string;
  tenantId: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  sku?: string;
  type?: ProductType;
  unit?: ProductUnit;
  stock?: number;
  minStock?: number;
  costPrice?: number;
  salePrice?: number;
  supplierId?: string;
  categoryId?: string;
  isActive?: boolean;
}

export class ProductService {
  async createProduct(data: CreateProductInput) {
    return await prisma.product.create({
      data: {
        ...data,
        stock: data.stock ?? 0,
        minStock: data.minStock ?? 0,
        costPrice: data.costPrice ?? 0,
        salePrice: data.salePrice ?? 0,
      },
      include: {
        supplier: true,
        category: true,
      },
    });
  }

  async getProducts(tenantId: string, filters?: {
    type?: ProductType;
    categoryId?: string;
    supplierId?: string;
    isActive?: boolean;
    lowStock?: boolean;
  }) {
    const where: any = { tenantId };

    if (filters?.type) where.type = filters.type;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.supplierId) where.supplierId = filters.supplierId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.lowStock) {
      where.AND = [
        { stock: { lte: prisma.product.fields.minStock } },
      ];
    }

    return await prisma.product.findMany({
      where,
      include: {
        supplier: true,
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getProductById(id: string, tenantId: string) {
    return await prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        category: true,
        inventoryMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async updateProduct(id: string, tenantId: string, data: UpdateProductInput) {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        supplier: true,
        category: true,
      },
    });
  }

  async deleteProduct(id: string, tenantId: string) {
    return await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getLowStockProducts(tenantId: string) {
    return await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        stock: {
          lte: prisma.product.fields.minStock,
        },
      },
      include: {
        category: true,
      },
      orderBy: { stock: 'asc' },
    });
  }

  async validateStock(productId: string, quantity: number): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return false;
    return product.stock >= quantity;
  }

  async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract') {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error('Product not found');

    const newStock = operation === 'add' 
      ? product.stock + quantity 
      : product.stock - quantity;

    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    return await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });
  }
}

export const productService = new ProductService();
