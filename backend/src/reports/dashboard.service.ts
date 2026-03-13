import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, PartRequisitionStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSalesSummary(filters?: { dateFrom?: string; dateTo?: string }) {
    const where: any = {
      paymentStatus: PaymentStatus.PAID,
    };

    if (filters?.dateFrom || filters?.dateTo) {
      where.paidAt = {};
      if (filters.dateFrom) {
        where.paidAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        where.paidAt.lte = dateTo;
      }
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            jobNo: true,
            createdAt: true,
          },
        },
      },
    });

    // Group by day
    const byDay = payments.reduce(
      (acc, payment) => {
        const dateKey = payment.paidAt
          ? payment.paidAt.toISOString().split('T')[0]
          : payment.createdAt.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            count: 0,
            totalAmount: 0,
          };
        }
        acc[dateKey].count += 1;
        acc[dateKey].totalAmount += Number(payment.totalAmount);
        return acc;
      },
      {} as Record<string, any>,
    );

    const totalAmount = payments.reduce(
      (sum, p) => sum + Number(p.totalAmount),
      0,
    );
    const totalJobs = payments.length;

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = payments.filter((p) => {
      const paidDate = p.paidAt || p.createdAt;
      return paidDate >= today;
    });
    const todaySales = todayPayments.reduce(
      (sum, p) => sum + Number(p.totalAmount),
      0,
    );

    // Calculate monthly sales
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyPayments = payments.filter((p) => {
      const paidDate = p.paidAt || p.createdAt;
      return paidDate >= monthStart;
    });
    const monthlySales = monthlyPayments.reduce(
      (sum, p) => sum + Number(p.totalAmount),
      0,
    );

    return {
      totalSales: totalAmount,
      todaySales,
      monthlySales,
      transactionCount: totalJobs,
      summary: {
        totalAmount,
        totalJobs,
        averagePerJob: totalJobs > 0 ? totalAmount / totalJobs : 0,
      },
      byDay: Object.values(byDay).sort((a: any, b: any) =>
        a.date.localeCompare(b.date),
      ),
    };
  }

  async getTopParts(filters?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    const where: any = {
      status: PartRequisitionStatus.ISSUED,
    };

    if (filters?.dateFrom || filters?.dateTo) {
      where.issuedAt = {};
      if (filters.dateFrom) {
        where.issuedAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        where.issuedAt.lte = dateTo;
      }
    }

    const requisitions = await this.prisma.partRequisition.findMany({
      where,
      include: {
        items: {
          include: {
            part: {
              select: {
                id: true,
                partNo: true,
                name: true,
              },
            },
            package: {
              include: {
                items: {
                  include: {
                    part: {
                      select: {
                        id: true,
                        partNo: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Aggregate by part
    const partStats = new Map<
      number,
      { partId: number; partNo: string; partName: string; quantity: number }
    >();

    for (const req of requisitions) {
      for (const item of req.items) {
        if (item.partId && item.issuedQuantity > 0) {
          const part = item.part;
          if (part) {
            const existing = partStats.get(part.id) || {
              partId: part.id,
              partNo: part.partNo,
              partName: part.name,
              quantity: 0,
            };
            existing.quantity += item.issuedQuantity;
            partStats.set(part.id, existing);
          }
        } else if (item.packageId && item.issuedQuantity > 0) {
          const package_ = item.package;
          if (package_) {
            for (const packageItem of package_.items) {
              const part = packageItem.part;
              if (part) {
                const totalQty = packageItem.quantity * item.issuedQuantity;
                const existing = partStats.get(part.id) || {
                  partId: part.id,
                  partNo: part.partNo,
                  partName: part.name,
                  quantity: 0,
                };
                existing.quantity += totalQty;
                partStats.set(part.id, existing);
              }
            }
          }
        }
      }
    }

    const topParts = Array.from(partStats.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, filters?.limit || 10);

    return topParts;
  }

  async getTechnicianPerformance(filters?: {
    dateFrom?: string;
    dateTo?: string;
    technicianId?: number;
  }) {
    const where: any = {};

    if (filters?.dateFrom || filters?.dateTo) {
      where.finishedAt = {};
      if (filters.dateFrom) {
        where.finishedAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        where.finishedAt.lte = dateTo;
      }
    }

    // Filter by technicianId if provided
    if (filters?.technicianId) {
      where.technicianId = filters.technicianId;
    }

    const laborTimes = await this.prisma.laborTime.findMany({
      where: {
        ...where,
        finishedAt: { not: null },
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        job: {
          select: {
            id: true,
            jobNo: true,
          },
        },
      },
    });

    // Group by technician
    const techStats = new Map<
      number,
      {
        technicianId: number;
        technicianName: string;
        totalJobs: number;
        totalHours: number;
        totalActualMinutes: number;
        totalStandardMinutes: number;
        totalCost: number;
      }
    >();

    for (const lt of laborTimes) {
      const techId = lt.technicianId;
      const existing = techStats.get(techId) || {
        technicianId: techId,
        technicianName: lt.technician.name,
        totalJobs: 0,
        totalHours: 0,
        totalActualMinutes: 0,
        totalStandardMinutes: 0,
        totalCost: 0,
      };

      existing.totalJobs += 1;
      existing.totalActualMinutes += lt.actualMinutes;
      if (lt.standardMinutes) {
        existing.totalStandardMinutes += lt.standardMinutes;
      }
      existing.totalCost += Number(lt.laborCost);

      techStats.set(techId, existing);
    }

    // Calculate hours and performance
    const performance = Array.from(techStats.values()).map((stat) => {
      const totalHours = stat.totalActualMinutes / 60;
      const avgTimePerJob =
        stat.totalJobs > 0 ? stat.totalActualMinutes / stat.totalJobs : 0;
      const efficiency =
        stat.totalStandardMinutes > 0
          ? (stat.totalStandardMinutes / stat.totalActualMinutes) * 100
          : 0;

      return {
        ...stat,
        totalHours: Number(totalHours.toFixed(2)),
        averageTimePerJob: Number((avgTimePerJob / 60).toFixed(2)), // in hours
        efficiency: Number(efficiency.toFixed(2)),
        averageCostPerJob:
          stat.totalJobs > 0
            ? Number((stat.totalCost / stat.totalJobs).toFixed(2))
            : 0,
      };
    });

    return performance.sort((a, b) => b.totalJobs - a.totalJobs);
  }

  async getTechnicianIdleTime(filters?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = {};

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        where.createdAt.lte = dateTo;
      }
    }

    // Get all labor times for technicians
    const laborTimes = await this.prisma.laborTime.findMany({
      where,
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        job: {
          select: {
            id: true,
            jobNo: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    // Group by technician and calculate gaps
    const techIdleTimes = new Map<
      number,
      {
        technicianId: number;
        technicianName: string;
        totalIdleMinutes: number;
        idlePeriods: Array<{ start: Date; end: Date; minutes: number }>;
      }
    >();

    // Group labor times by technician
    const byTechnician = new Map<number, typeof laborTimes>();
    for (const lt of laborTimes) {
      const techId = lt.technicianId;
      if (!byTechnician.has(techId)) {
        byTechnician.set(techId, []);
        techIdleTimes.set(techId, {
          technicianId: techId,
          technicianName: lt.technician.name,
          totalIdleMinutes: 0,
          idlePeriods: [],
        });
      }
      byTechnician.get(techId)!.push(lt);
    }

    // Calculate idle time between jobs
    for (const [techId, times] of byTechnician.entries()) {
      const stat = techIdleTimes.get(techId)!;
      const sortedTimes = times.sort(
        (a, b) => (a.startedAt?.getTime() || 0) - (b.startedAt?.getTime() || 0),
      );

      for (let i = 0; i < sortedTimes.length - 1; i++) {
        const current = sortedTimes[i];
        const next = sortedTimes[i + 1];

        const currentEnd = current.finishedAt || current.pausedAt || new Date();
        const nextStart = next.startedAt || new Date();

        if (nextStart > currentEnd) {
          const idleMinutes = Math.floor(
            (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60),
          );
          stat.totalIdleMinutes += idleMinutes;
          stat.idlePeriods.push({
            start: currentEnd,
            end: nextStart,
            minutes: idleMinutes,
          });
        }
      }
    }

    return Array.from(techIdleTimes.values()).map((stat) => ({
      technicianId: stat.technicianId,
      technicianName: stat.technicianName,
      totalIdleHours: Number((stat.totalIdleMinutes / 60).toFixed(2)),
      totalIdleMinutes: stat.totalIdleMinutes,
      idlePeriodsCount: stat.idlePeriods.length,
    }));
  }
}
