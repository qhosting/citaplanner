
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportService {
  async getSalesReport(tenantId: string, filters: {
    startDate: Date;
    endDate: Date;
    groupBy?: 'day' | 'week' | 'month';
    productId?: string;
    serviceId?: string;
    professionalId?: string;
    clientId?: string;
    paymentMethod?: string;
  }) {
    const where: any = {
      tenantId,
      status: 'COMPLETED',
      saleDate: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    };

    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

    const sales = await prisma.sale.findMany({
      where,
      include: {
        saleItems: {
          include: {
            service: true,
            product: true,
            professional: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        client: true,
      },
      orderBy: { saleDate: 'asc' },
    });

    // Filter by product/service/professional if specified
    let filteredSales = sales;
    if (filters.productId || filters.serviceId || filters.professionalId) {
      filteredSales = sales.filter(sale => 
        sale.saleItems.some(item => {
          if (filters.productId && item.productId === filters.productId) return true;
          if (filters.serviceId && item.serviceId === filters.serviceId) return true;
          if (filters.professionalId && item.professionalId === filters.professionalId) return true;
          return false;
        })
      );
    }

    // Calculate totals
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalDiscount = filteredSales.reduce((sum, sale) => sum + sale.discount, 0);
    const totalTax = filteredSales.reduce((sum, sale) => sum + sale.tax, 0);

    // Group by period if specified
    let groupedData: any[] = [];
    if (filters.groupBy) {
      const groups = new Map();
      
      filteredSales.forEach(sale => {
        const key = this.getGroupKey(sale.saleDate, filters.groupBy!);
        if (!groups.has(key)) {
          groups.set(key, {
            period: key,
            sales: 0,
            total: 0,
            count: 0,
          });
        }
        const group = groups.get(key);
        group.total += sale.total;
        group.count += 1;
      });

      groupedData = Array.from(groups.values()).sort((a, b) => 
        a.period.localeCompare(b.period)
      );
    }

    return {
      summary: {
        totalSales,
        totalDiscount,
        totalTax,
        salesCount: filteredSales.length,
        averageSale: filteredSales.length > 0 ? totalSales / filteredSales.length : 0,
      },
      groupedData,
      sales: filteredSales,
    };
  }

  async getTopProducts(tenantId: string, startDate: Date, endDate: Date, limit = 10) {
    const sales = await prisma.sale.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const productStats = new Map();

    sales.forEach(sale => {
      sale.saleItems.forEach(item => {
        if (item.itemType === 'PRODUCT' && item.product) {
          const key = item.productId!;
          if (!productStats.has(key)) {
            productStats.set(key, {
              product: item.product,
              quantity: 0,
              revenue: 0,
              salesCount: 0,
            });
          }
          const stats = productStats.get(key);
          stats.quantity += item.quantity;
          stats.revenue += item.subtotal;
          stats.salesCount += 1;
        }
      });
    });

    return Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getTopServices(tenantId: string, startDate: Date, endDate: Date, limit = 10) {
    const sales = await prisma.sale.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        saleItems: {
          include: {
            service: true,
          },
        },
      },
    });

    const serviceStats = new Map();

    sales.forEach(sale => {
      sale.saleItems.forEach(item => {
        if (item.itemType === 'SERVICE' && item.service) {
          const key = item.serviceId!;
          if (!serviceStats.has(key)) {
            serviceStats.set(key, {
              service: item.service,
              quantity: 0,
              revenue: 0,
              salesCount: 0,
              totalCommissions: 0,
            });
          }
          const stats = serviceStats.get(key);
          stats.quantity += item.quantity;
          stats.revenue += item.subtotal;
          stats.salesCount += 1;
          stats.totalCommissions += item.commissionAmount || 0;
        }
      });
    });

    return Array.from(serviceStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getProfessionalPerformance(tenantId: string, startDate: Date, endDate: Date) {
    const sales = await prisma.sale.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        saleItems: {
          include: {
            professional: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const professionalStats = new Map();

    sales.forEach(sale => {
      sale.saleItems.forEach(item => {
        if (item.professionalId && item.professional) {
          const key = item.professionalId;
          if (!professionalStats.has(key)) {
            professionalStats.set(key, {
              professional: item.professional,
              servicesCount: 0,
              revenue: 0,
              commissions: 0,
            });
          }
          const stats = professionalStats.get(key);
          stats.servicesCount += item.quantity;
          stats.revenue += item.subtotal;
          stats.commissions += item.commissionAmount || 0;
        }
      });
    });

    return Array.from(professionalStats.values())
      .sort((a, b) => b.revenue - a.revenue);
  }

  private getGroupKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (groupBy) {
      case 'day':
        return `${year}-${month}-${day}`;
      case 'week':
        const weekNum = this.getWeekNumber(date);
        return `${year}-W${String(weekNum).padStart(2, '0')}`;
      case 'month':
        return `${year}-${month}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}

export const reportService = new ReportService();
