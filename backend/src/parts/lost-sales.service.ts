import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLostSaleDto } from './dto/create-lost-sale.dto';

@Injectable()
export class LostSalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLostSaleDto) {
    // Verify part exists
    const part = await this.prisma.part.findUnique({
      where: { id: dto.partId },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${dto.partId} not found`);
    }

    const totalValue = dto.quantity * dto.unitPrice;

    return this.prisma.lostSale.create({
      data: {
        partId: dto.partId,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        totalValue,
        customerInfo: dto.customerInfo,
        notes: dto.notes,
      },
      include: {
        part: {
          select: {
            id: true,
            partNo: true,
            name: true,
            unit: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    dateFrom?: string;
    dateTo?: string;
    partId?: number;
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

    if (filters?.partId) {
      where.partId = filters.partId;
    }

    return this.prisma.lostSale.findMany({
      where,
      include: {
        part: {
          select: {
            id: true,
            partNo: true,
            name: true,
            unit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const lostSale = await this.prisma.lostSale.findUnique({
      where: { id },
      include: {
        part: {
          select: {
            id: true,
            partNo: true,
            name: true,
            unit: true,
          },
        },
      },
    });

    if (!lostSale) {
      throw new NotFoundException(`Lost Sale with ID ${id} not found`);
    }

    return lostSale;
  }

  async getSummary(filters?: { dateFrom?: string; dateTo?: string }) {
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

    const lostSales = await this.prisma.lostSale.findMany({
      where,
      include: {
        part: {
          select: {
            id: true,
            partNo: true,
            name: true,
          },
        },
      },
    });

    // Group by part
    const summary = lostSales.reduce(
      (acc, lostSale) => {
        const partId = lostSale.partId;
        if (!acc[partId]) {
          acc[partId] = {
            partId,
            partNo: lostSale.part.partNo,
            partName: lostSale.part.name,
            totalQuantity: 0,
            totalValue: 0,
            count: 0,
          };
        }

        acc[partId].totalQuantity += lostSale.quantity;
        acc[partId].totalValue += Number(lostSale.totalValue);
        acc[partId].count += 1;

        return acc;
      },
      {} as Record<number, any>,
    );

    const summaryArray = Object.values(summary);
    summaryArray.sort((a: any, b: any) => b.totalValue - a.totalValue);

    return {
      totalLostSales: lostSales.length,
      totalValue: lostSales.reduce((sum, ls) => sum + Number(ls.totalValue), 0),
      byPart: summaryArray,
    };
  }
}
