import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * รายงานรายวัน
   */
  async getDailyReport(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [payments, newJobs, completedJobs, cancelledJobs] = await Promise.all(
      [
        this.prisma.payment.findMany({
          where: {
            paymentStatus: PaymentStatus.PAID,
            paidAt: { gte: startOfDay, lte: endOfDay },
          },
          include: {
            job: {
              include: {
                laborTimes: true,
                partRequisitions: {
                  include: { items: { include: { part: true } } },
                },
              },
            },
          },
        }),
        this.prisma.job.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        this.prisma.job.count({
          where: {
            completedAt: { gte: startOfDay, lte: endOfDay },
            status: { in: [JobStatus.COMPLETED, JobStatus.PAID] },
          },
        }),
        this.prisma.job.count({
          where: {
            updatedAt: { gte: startOfDay, lte: endOfDay },
            status: JobStatus.CANCELLED,
          },
        }),
      ],
    );

    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.totalAmount),
      0,
    );
    const totalJobs = payments.length;

    return {
      date: startOfDay.toISOString().slice(0, 10),
      totalRevenue,
      totalJobsPaid: totalJobs,
      newJobs,
      completedJobs,
      cancelledJobs,
      payments: payments.map((p) => ({
        paymentNo: p.paymentNo,
        totalAmount: p.totalAmount,
        paymentMethod: p.paymentMethod,
        paidAt: p.paidAt,
      })),
    };
  }

  /**
   * รายงานรายเดือน
   */
  async getMonthlyReport(month: number, year: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const [payments, newJobs, completedJobs, cancelledJobs] = await Promise.all(
      [
        this.prisma.payment.findMany({
          where: {
            paymentStatus: PaymentStatus.PAID,
            paidAt: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.job.count({
          where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
        }),
        this.prisma.job.count({
          where: {
            completedAt: { gte: startOfMonth, lte: endOfMonth },
            status: { in: [JobStatus.COMPLETED, JobStatus.PAID] },
          },
        }),
        this.prisma.job.count({
          where: {
            updatedAt: { gte: startOfMonth, lte: endOfMonth },
            status: JobStatus.CANCELLED,
          },
        }),
      ],
    );

    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.totalAmount),
      0,
    );

    // Daily breakdown
    const dailyBreakdown: Record<string, number> = {};
    payments.forEach((p) => {
      if (p.paidAt) {
        const day = p.paidAt.toISOString().slice(0, 10);
        dailyBreakdown[day] =
          (dailyBreakdown[day] || 0) + Number(p.totalAmount);
      }
    });

    return {
      month,
      year,
      totalRevenue,
      totalJobsPaid: payments.length,
      newJobs,
      completedJobs,
      cancelledJobs,
      dailyBreakdown,
    };
  }

  /**
   * รายงานกำไร
   */
  async getProfitReport(dateFrom: Date, dateTo: Date) {
    const payments = await this.prisma.payment.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        paidAt: { gte: dateFrom, lte: dateTo },
      },
      include: {
        job: {
          include: {
            partRequisitions: {
              where: { status: 'ISSUED' },
              include: { items: { include: { part: true } } },
            },
            laborTimes: true,
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalPartsCost = 0;
    let totalLaborRevenue = 0;

    for (const payment of payments) {
      totalRevenue += Number(payment.totalAmount);
      if (payment.job) {
        for (const req of payment.job.partRequisitions) {
          for (const item of req.items) {
            if (item.part) {
              totalPartsCost +=
                Number(item.part.unitPrice) * item.issuedQuantity;
            }
          }
        }
        for (const labor of payment.job.laborTimes) {
          totalLaborRevenue += Number(labor.laborCost);
        }
      }
    }

    const grossProfit = totalRevenue - totalPartsCost;

    return {
      dateFrom: dateFrom.toISOString().slice(0, 10),
      dateTo: dateTo.toISOString().slice(0, 10),
      totalRevenue,
      totalPartsCost,
      totalLaborRevenue,
      grossProfit,
      profitMargin:
        totalRevenue > 0
          ? ((grossProfit / totalRevenue) * 100).toFixed(2) + '%'
          : '0%',
      totalJobsPaid: payments.length,
    };
  }

  /**
   * งานค้าง (แยกตามสถานะ)
   */
  async getPendingJobs() {
    const statuses = [
      JobStatus.PENDING,
      JobStatus.IN_PROGRESS,
      JobStatus.WAITING_PARTS,
      JobStatus.QC_PENDING,
      JobStatus.CLEANING,
      JobStatus.READY_FOR_DELIVERY,
    ];

    const counts = await Promise.all(
      statuses.map((status) => this.prisma.job.count({ where: { status } })),
    );

    const jobs = await this.prisma.job.findMany({
      where: { status: { in: statuses } },
      include: {
        motorcycle: { include: { owner: true } },
        technician: { select: { id: true, name: true } },
      },
      orderBy: [{ jobType: 'asc' }, { createdAt: 'asc' }],
    });

    const summary: Record<string, number> = {};
    statuses.forEach((s, i) => {
      summary[s] = counts[i];
    });

    return {
      total: counts.reduce((a, b) => a + b, 0),
      summary,
      jobs,
    };
  }

  /**
   * รายงานเงินเดือน + ค่าคอม
   */
  async getEmployeeSalaryReport(month: number, year: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const employees = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        baseSalary: true,
        commissionRate: true,
      },
    });

    const result: Array<{
      id: number;
      name: string;
      role: string;
      baseSalary: number;
      commissionRate: number | null;
      jobCount: number;
      commission: number;
      totalSalary: number;
    }> = [];

    for (const emp of employees) {
      let commission = 0;
      let jobCount = 0;

      // คำนวณค่าคอมสำหรับช่างและหัวหน้าช่าง
      if (emp.role === 'TECHNICIAN' || emp.role === 'FOREMAN') {
        const completedJobs = await this.prisma.job.findMany({
          where: {
            technicianId: emp.id,
            status: { in: [JobStatus.COMPLETED, JobStatus.PAID] },
            completedAt: { gte: startOfMonth, lte: endOfMonth },
          },
          include: {
            payment: true,
          },
        });

        jobCount = completedJobs.length;

        if (emp.commissionRate) {
          for (const job of completedJobs) {
            if (
              job.payment &&
              job.payment.paymentStatus === PaymentStatus.PAID
            ) {
              commission +=
                (Number(job.payment.totalAmount) * Number(emp.commissionRate)) /
                100;
            }
          }
        }
      }

      const baseSalary = Number(emp.baseSalary || 0);

      result.push({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        baseSalary,
        commissionRate: emp.commissionRate ? Number(emp.commissionRate) : null,
        jobCount,
        commission: Math.round(commission * 100) / 100,
        totalSalary: Math.round((baseSalary + commission) * 100) / 100,
      });
    }

    return {
      month,
      year,
      employees: result,
    };
  }

  /**
   * สต๊อกคงเหลือ
   */
  async getStockSummary() {
    const parts = await this.prisma.part.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const totalItems = parts.length;
    const totalStockValue = parts.reduce(
      (sum, p) => sum + Number(p.unitPrice) * p.stockQuantity,
      0,
    );

    return {
      totalItems,
      totalStockValue,
      parts: parts.map((p) => ({
        id: p.id,
        partNo: p.partNo,
        name: p.name,
        category: p.category,
        stockQuantity: p.stockQuantity,
        unitPrice: p.unitPrice,
        stockValue: Number(p.unitPrice) * p.stockQuantity,
        reorderPoint: p.reorderPoint,
      })),
    };
  }

  /**
   * อะไหล่ใกล้หมด
   */
  async getLowStockReport() {
    const parts = await this.prisma.$queryRaw`
      SELECT * FROM "Part"
      WHERE "isActive" = true AND "stockQuantity" <= "reorderPoint"
      ORDER BY "stockQuantity" ASC
    `;
    return parts;
  }

  /**
   * อะไหล่ขายดี (เบิกออกมากที่สุด)
   */
  async getBestSellersReport(dateFrom: Date, dateTo: Date) {
    const movements = await this.prisma.stockMovement.findMany({
      where: {
        movementType: 'OUT',
        createdAt: { gte: dateFrom, lte: dateTo },
      },
      include: { part: true },
    });

    const partMap: Record<
      number,
      {
        partNo: string;
        name: string;
        category: string | null;
        totalOut: number;
      }
    > = {};
    for (const m of movements) {
      if (!partMap[m.partId]) {
        partMap[m.partId] = {
          partNo: m.part.partNo,
          name: m.part.name,
          category: m.part.category,
          totalOut: 0,
        };
      }
      partMap[m.partId].totalOut += m.quantity;
    }

    return Object.entries(partMap)
      .map(([id, data]) => ({ partId: +id, ...data }))
      .sort((a, b) => b.totalOut - a.totalOut);
  }

  /**
   * อะไหล่ไม่เคลื่อนไหว
   */
  async getNonMovingReport(days: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // ดึง parts ที่ active ทั้งหมด
    const parts = await this.prisma.part.findMany({
      where: { isActive: true },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // กรองเฉพาะอะไหล่ที่ไม่มี movement หลังวัน cutoff
    return parts
      .filter((p) => {
        if (p.stockMovements.length === 0) return true;
        return p.stockMovements[0].createdAt < cutoffDate;
      })
      .map((p) => ({
        id: p.id,
        partNo: p.partNo,
        name: p.name,
        category: p.category,
        stockQuantity: p.stockQuantity,
        unitPrice: p.unitPrice,
        lastMovement: p.stockMovements[0]?.createdAt || null,
      }));
  }
}
