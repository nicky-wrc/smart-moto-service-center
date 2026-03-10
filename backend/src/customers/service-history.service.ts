import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceHistoryService {
  constructor(private prisma: PrismaService) {}

  async getHistory(customerId: number, motorcycleId: number) {
    // Verify customer and motorcycle
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const motorcycle = await this.prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
    });

    if (!motorcycle) {
      throw new NotFoundException(
        `Motorcycle with ID ${motorcycleId} not found`,
      );
    }

    if (motorcycle.ownerId !== customerId) {
      throw new NotFoundException(
        'Motorcycle does not belong to this customer',
      );
    }

    // Get all jobs for this motorcycle
    const jobs = await this.prisma.job.findMany({
      where: { motorcycleId },
      include: {
        laborTimes: {
          include: {
            technician: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        outsources: true,
        partRequisitions: {
          include: {
            items: {
              include: {
                part: {
                  select: {
                    id: true,
                    partNo: true,
                    name: true,
                    unitPrice: true,
                  },
                },
                package: {
                  select: {
                    id: true,
                    packageNo: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            paymentNo: true,
            totalAmount: true,
            paymentStatus: true,
            paidAt: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format history by date
    const historyByDate = jobs.reduce((acc, job) => {
      const dateKey = job.createdAt.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(job);
      return acc;
    }, {} as Record<string, typeof jobs>);

    return {
      customer: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
      },
      motorcycle: {
        id: motorcycle.id,
        licensePlate: motorcycle.licensePlate,
        brand: motorcycle.brand,
        model: motorcycle.model,
      },
      totalJobs: jobs.length,
      historyByDate: Object.entries(historyByDate).map(([date, jobs]) => ({
        date,
        jobs,
      })),
    };
  }
}
