
import { PrismaClient, MovementType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateMovementInput {
  tenantId: string;
  productId: string;
  movementType: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  userId: string;
}

export class InventoryService {
  async createMovement(data: CreateMovementInput) {
    return await prisma.inventoryMovement.create({
      data,
      include: {
        product: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getMovements(tenantId: string, filters?: {
    productId?: string;
    movementType?: MovementType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { tenantId };

    if (filters?.productId) where.productId = filters.productId;
    if (filters?.movementType) where.movementType = filters.movementType;
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return await prisma.inventoryMovement.findMany({
      where,
      include: {
        product: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdjustment(
    tenantId: string,
    productId: string,
    newStock: number,
    reason: string,
    userId: string
  ) {
    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId },
    });

    if (!product) throw new Error('Product not found');

    const difference = newStock - product.stock;
    const movementType = difference > 0 ? MovementType.IN : MovementType.OUT;

    return await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      return await tx.inventoryMovement.create({
        data: {
          tenantId,
          productId,
          movementType: MovementType.ADJUSTMENT,
          quantity: Math.abs(difference),
          reason,
          userId,
        },
        include: {
          product: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    });
  }

  async getStockReport(tenantId: string) {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { name: 'asc' },
    });

    return products.map(product => ({
      ...product,
      stockStatus: product.stock <= product.minStock ? 'LOW' : 'OK',
      stockValue: product.stock * product.costPrice,
    }));
  }
}

export const inventoryService = new InventoryService();
