
import { PrismaClient, SaleStatus, SalePaymentMethod } from '@prisma/client';
import { productService } from './productService';
import { inventoryService } from './inventoryService';
import { commissionService } from './commissionService';

const prisma = new PrismaClient();

export interface SaleItemInput {
  itemType: 'SERVICE' | 'PRODUCT';
  serviceId?: string;
  productId?: string;
  professionalId?: string;
  quantity: number;
  unitPrice: number;
  commissionRate?: number;
}

export interface CreateSaleInput {
  clientId?: string;
  userId: string;
  tenantId: string;
  items: SaleItemInput[];
  discount?: number;
  tax?: number;
  paymentMethod: SalePaymentMethod;
  notes?: string;
}

export class SaleService {
  async createSale(data: CreateSaleInput) {
    // Generate unique sale number
    const saleNumber = await this.generateSaleNumber(data.tenantId);

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of data.items) {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;

      let commissionAmount = 0;
      if (item.itemType === 'SERVICE' && item.commissionRate) {
        commissionAmount = itemSubtotal * (item.commissionRate / 100);
      }

      processedItems.push({
        ...item,
        subtotal: itemSubtotal,
        commissionAmount,
      });

      // Validate stock for products
      if (item.itemType === 'PRODUCT' && item.productId) {
        const hasStock = await productService.validateStock(item.productId, item.quantity);
        if (!hasStock) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          throw new Error(`Insufficient stock for product: ${product?.name}`);
        }
      }
    }

    const discount = data.discount ?? 0;
    const tax = data.tax ?? 0;
    const total = subtotal - discount + tax;

    // Create sale with items in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          tenantId: data.tenantId,
          clientId: data.clientId,
          userId: data.userId,
          subtotal,
          discount,
          tax,
          total,
          paymentMethod: data.paymentMethod,
          status: SaleStatus.COMPLETED,
          notes: data.notes,
          saleItems: {
            create: processedItems,
          },
        },
        include: {
          saleItems: {
            include: {
              service: true,
              product: true,
              professional: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          client: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Process inventory movements and commissions
      for (const item of processedItems) {
        // Deduct product stock
        if (item.itemType === 'PRODUCT' && item.productId) {
          await productService.updateStock(item.productId, item.quantity, 'subtract');
          await inventoryService.createMovement({
            tenantId: data.tenantId,
            productId: item.productId,
            movementType: 'OUT',
            quantity: item.quantity,
            reason: 'Sale',
            reference: saleNumber,
            userId: data.userId,
          });
        }

        // Record commission for services
        if (item.itemType === 'SERVICE' && item.professionalId && item.commissionAmount) {
          await commissionService.recordCommission({
            tenantId: data.tenantId,
            professionalId: item.professionalId,
            amount: item.commissionAmount,
            saleAmount: item.subtotal,
          });
        }
      }

      return newSale;
    });

    return sale;
  }

  async getSales(tenantId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    clientId?: string;
    userId?: string;
    status?: SaleStatus;
    paymentMethod?: SalePaymentMethod;
  }) {
    const where: any = { tenantId };

    if (filters?.startDate || filters?.endDate) {
      where.saleDate = {};
      if (filters.startDate) where.saleDate.gte = filters.startDate;
      if (filters.endDate) where.saleDate.lte = filters.endDate;
    }

    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.status) where.status = filters.status;
    if (filters?.paymentMethod) where.paymentMethod = filters.paymentMethod;

    return await prisma.sale.findMany({
      where,
      include: {
        client: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        saleItems: {
          include: {
            service: true,
            product: true,
            professional: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { saleDate: 'desc' },
    });
  }

  async getSaleById(id: string, tenantId: string) {
    return await prisma.sale.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        saleItems: {
          include: {
            service: true,
            product: true,
            professional: {
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

  async cancelSale(id: string, tenantId: string, userId: string) {
    const sale = await this.getSaleById(id, tenantId);
    if (!sale) throw new Error('Sale not found');
    if (sale.status === SaleStatus.CANCELLED) throw new Error('Sale already cancelled');

    return await prisma.$transaction(async (tx) => {
      // Update sale status
      const updatedSale = await tx.sale.update({
        where: { id },
        data: { status: SaleStatus.CANCELLED },
      });

      // Restore product stock
      for (const item of sale.saleItems) {
        if (item.itemType === 'PRODUCT' && item.productId) {
          await productService.updateStock(item.productId, item.quantity, 'add');
          await inventoryService.createMovement({
            tenantId,
            productId: item.productId,
            movementType: 'IN',
            quantity: item.quantity,
            reason: 'Sale cancellation',
            reference: sale.saleNumber,
            userId,
          });
        }

        // Reverse commission
        if (item.itemType === 'SERVICE' && item.professionalId && item.commissionAmount) {
          await commissionService.recordCommission({
            tenantId,
            professionalId: item.professionalId,
            amount: -item.commissionAmount,
            saleAmount: -item.subtotal,
          });
        }
      }

      return updatedSale;
    });
  }

  private async generateSaleNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `${year}${month}${day}`;

    const lastSale = await prisma.sale.findFirst({
      where: {
        tenantId,
        saleNumber: {
          startsWith: prefix,
        },
      },
      orderBy: { saleNumber: 'desc' },
    });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.saleNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}

export const saleService = new SaleService();
