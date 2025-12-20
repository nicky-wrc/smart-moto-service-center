import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OutsourcesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    jobId: number;
    vendorName: string;
    workDescription: string;
    cost: number;
    sellingPrice?: number;
    estimatedDays?: number;
    notes?: string;
  }) {
    const job = await this.prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${data.jobId} not found`);
    }

    const sellingPrice = data.sellingPrice || data.cost * 1.2;

    return this.prisma.outsource.create({
      data: {
        ...data,
        sellingPrice,
      },
      include: {
        job: {
          include: {
            motorcycle: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(jobId?: number) {
    const where: any = {};
    if (jobId) {
      where.jobId = jobId;
    }

    return this.prisma.outsource.findMany({
      where,
      include: {
        job: {
          include: {
            motorcycle: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const outsource = await this.prisma.outsource.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            motorcycle: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!outsource) {
      throw new NotFoundException(`Outsource with ID ${id} not found`);
    }

    return outsource;
  }

  async update(
    id: number,
    data: {
      vendorName?: string;
      workDescription?: string;
      cost?: number;
      sellingPrice?: number;
      estimatedDays?: number;
      completedAt?: Date;
      notes?: string;
    },
  ) {
    const outsource = await this.prisma.outsource.findUnique({
      where: { id },
    });

    if (!outsource) {
      throw new NotFoundException(`Outsource with ID ${id} not found`);
    }

    return this.prisma.outsource.update({
      where: { id },
      data,
      include: {
        job: {
          include: {
            motorcycle: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number) {
    const outsource = await this.prisma.outsource.findUnique({
      where: { id },
    });

    if (!outsource) {
      throw new NotFoundException(`Outsource with ID ${id} not found`);
    }

    return this.prisma.outsource.delete({
      where: { id },
    });
  }

  async getTotalOutsourceCost(jobId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const outsources = await this.prisma.outsource.findMany({
      where: { jobId },
    });

    const totalCost = outsources.reduce(
      (sum, o) => sum + Number(o.sellingPrice),
      0,
    );

    return {
      jobId,
      totalCost,
      outsources: outsources.length,
      items: outsources.map((o) => ({
        id: o.id,
        vendorName: o.vendorName,
        workDescription: o.workDescription,
        cost: Number(o.cost),
        sellingPrice: Number(o.sellingPrice),
      })),
    };
  }
}
