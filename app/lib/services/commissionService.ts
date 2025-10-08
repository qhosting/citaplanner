
import { PrismaClient, CommissionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface RecordCommissionInput {
  tenantId: string;
  professionalId: string;
  amount: number;
  saleAmount: number;
}

export class CommissionService {
  async recordCommission(data: RecordCommissionInput) {
    const period = this.getCurrentPeriod();

    // Find or create commission record for the period
    const commission = await prisma.professionalCommission.upsert({
      where: {
        tenantId_professionalId_period: {
          tenantId: data.tenantId,
          professionalId: data.professionalId,
          period,
        },
      },
      update: {
        totalSales: {
          increment: data.saleAmount,
        },
        totalCommissions: {
          increment: data.amount,
        },
      },
      create: {
        tenantId: data.tenantId,
        professionalId: data.professionalId,
        period,
        totalSales: data.saleAmount,
        totalCommissions: data.amount,
        status: CommissionStatus.PENDING,
      },
    });

    return commission;
  }

  async getCommissions(tenantId: string, filters?: {
    professionalId?: string;
    period?: string;
    status?: CommissionStatus;
  }) {
    const where: any = { tenantId };

    if (filters?.professionalId) where.professionalId = filters.professionalId;
    if (filters?.period) where.period = filters.period;
    if (filters?.status) where.status = filters.status;

    return await prisma.professionalCommission.findMany({
      where,
      include: {
        professional: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { period: 'desc' },
        { professional: { firstName: 'asc' } },
      ],
    });
  }

  async markAsPaid(id: string, tenantId: string, notes?: string) {
    return await prisma.professionalCommission.update({
      where: { id },
      data: {
        status: CommissionStatus.PAID,
        paidDate: new Date(),
        notes,
      },
    });
  }

  async getCommissionSummary(tenantId: string, professionalId: string, period?: string) {
    const where: any = { tenantId, professionalId };
    if (period) where.period = period;

    const commissions = await prisma.professionalCommission.findMany({
      where,
      orderBy: { period: 'desc' },
    });

    const summary = {
      totalPending: 0,
      totalPaid: 0,
      totalSales: 0,
      byPeriod: commissions,
    };

    commissions.forEach(comm => {
      if (comm.status === CommissionStatus.PENDING) {
        summary.totalPending += comm.totalCommissions;
      } else {
        summary.totalPaid += comm.totalCommissions;
      }
      summary.totalSales += comm.totalSales;
    });

    return summary;
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}

export const commissionService = new CommissionService();
