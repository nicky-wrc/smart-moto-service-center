import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, JobStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async calculateBilling(jobId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        laborTimes: true,
        outsources: true,
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Calculate labor cost
    const now = new Date();
    let laborCost = 0;
    for (const lt of job.laborTimes) {
      let minutes = lt.actualMinutes;
      if (!lt.finishedAt && lt.startedAt) {
        const startTime = lt.startedAt;
        const resumeTime = lt.resumedAt || startTime;
        const endTime = lt.pausedAt || now;
        const elapsedMinutes = Math.floor(
          (endTime.getTime() - resumeTime.getTime()) / (1000 * 60),
        );
        minutes = lt.actualMinutes + elapsedMinutes;
      }
      laborCost += (minutes / 60) * Number(lt.hourlyRate);
    }

    // Calculate parts cost (from requisitions)
    const partsCost = 0; // TODO: Calculate from part requisitions

    // Calculate outsource cost
    const outsourceCost = job.outsources.reduce(
      (sum, o) => sum + Number(o.sellingPrice),
      0,
    );

    // Calculate subtotal
    const subtotal = laborCost + partsCost + outsourceCost;

    // Calculate VAT (7%)
    const vat = subtotal * 0.07;

    // Total amount
    const totalAmount = subtotal + vat;

    // Points earned (1 point per 100 baht)
    const pointsEarned = Math.floor(totalAmount / 100);

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { jobId },
    });

    return {
      jobId: job.id,
      jobNo: job.jobNo,
      owner: job.motorcycle.owner,
      breakdown: {
        laborCost,
        partsCost,
        outsourceCost,
        subtotal,
        discount: 0,
        pointsUsed: 0,
        vat,
        totalAmount,
      },
      pointsEarned,
      existingPayment,
    };
  }

  async create(data: {
    jobId: number;
    paymentMethod: string;
    subtotal: number;
    discount?: number;
    pointsUsed?: number;
    vat?: number;
    totalAmount: number;
    notes?: string;
  }) {
    const job = await this.prisma.job.findUnique({
      where: { id: data.jobId },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${data.jobId} not found`);
    }

    if (job.status !== JobStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot create payment for job with status ${job.status}`,
      );
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { jobId: data.jobId },
    });

    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this job');
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.payment.count({
      where: {
        createdAt: {
          gte: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
          ),
        },
      },
    });
    const runNo = (count + 1).toString().padStart(4, '0');
    const paymentNo = `PAY-${dateStr}-${runNo}`;

    const pointsEarned = Math.floor(data.totalAmount / 100);

    return this.prisma.payment.create({
      data: {
        paymentNo,
        jobId: data.jobId,
        customerId: job.motorcycle.ownerId,
        paymentMethod: data.paymentMethod as PaymentMethod,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        pointsUsed: data.pointsUsed || 0,
        pointsEarned,
        vat: data.vat || 0,
        totalAmount: data.totalAmount,
        paymentStatus: PaymentStatus.PENDING,
        notes: data.notes,
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

  async processPayment(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Payment already processed');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: payment.jobId },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
      },
    });

    // Update payment status
    await this.prisma.payment.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });

    // Update job status
    await this.prisma.job.update({
      where: { id: payment.jobId },
      data: {
        status: JobStatus.PAID,
      },
    });

    // Update customer points
    if (!job) {
      throw new NotFoundException(`Job with ID ${payment.jobId} not found`);
    }

    const totalAmount =
      typeof payment.totalAmount === 'number'
        ? payment.totalAmount
        : Number(payment.totalAmount);
    const pointsEarned = Math.floor(totalAmount / 100);
    await this.prisma.customer.update({
      where: { id: job.motorcycle.ownerId },
      data: {
        points: {
          increment: pointsEarned - (payment.pointsUsed || 0),
        },
      },
    });

    return this.prisma.payment.findUnique({
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
  }

  async findAll(filters?: {
    paymentStatus?: PaymentStatus;
    paymentMethod?: string;
    customerId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters?.paymentStatus) {
      where.status = filters.paymentStatus;
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters?.customerId || filters?.dateFrom || filters?.dateTo) {
      where.job = {
        motorcycle: {
          ...(filters?.customerId ? { ownerId: filters.customerId } : {}),
        },
        ...(filters?.dateFrom || filters?.dateTo
          ? {
              createdAt: {
                ...(filters?.dateFrom ? { gte: filters.dateFrom } : {}),
                ...(filters?.dateTo ? { lte: filters.dateTo } : {}),
              },
            }
          : {}),
      };
    }

    return this.prisma.payment.findMany({
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
    const payment = await this.prisma.payment.findUnique({
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

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByJob(jobId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { jobId },
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

    return payment;
  }
}
