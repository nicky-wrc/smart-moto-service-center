import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuotationStatus, JobStatus, JobType } from '@prisma/client';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    customerId: number;
    motorcycleId: number;
    items: Array<{
      itemType: string;
      itemName: string;
      quantity: number;
      unitPrice: number;
      partId?: number;
      packageId?: number;
    }>;
    validUntil?: Date;
    notes?: string;
    createdById: number;
  }) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.quotation.count({
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
    const quotationNo = `QT-${dateStr}-${runNo}`;

    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNo,
        customerId: data.customerId,
        motorcycleId: data.motorcycleId,
        createdById: data.createdById,
        status: QuotationStatus.DRAFT,
        validUntil: data.validUntil,
        notes: data.notes,
      },
    });

    await this.prisma.quotationItem.createMany({
      data: data.items.map((item) => ({
        quotationId: quotation.id,
        itemType: item.itemType,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        partId: item.partId || null,
        packageId: item.packageId || null,
      })),
    });

    return this.prisma.quotation.findUnique({
      where: { id: quotation.id },
      include: {
        customer: true,
        motorcycle: {
          include: {
            owner: true,
          },
        },
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    status?: QuotationStatus;
    customerId?: number;
    motorcycleId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.motorcycleId) {
      where.motorcycleId = filters.motorcycleId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {
        ...(filters?.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters?.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    return this.prisma.quotation.findMany({
      where,
      include: {
        customer: true,
        motorcycle: {
          include: {
            owner: true,
          },
        },
        items: true,
        createdBy: {
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
  }

  async findOne(id: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        motorcycle: {
          include: {
            owner: true,
          },
        },
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  async sendQuotation(id: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException(`Can only send draft quotations`);
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        status: QuotationStatus.SENT,
      },
      include: {
        customer: true,
        motorcycle: {
          include: {
            owner: true,
          },
        },
        items: true,
      },
    });
  }

  async approveQuotation(id: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    if (quotation.status !== QuotationStatus.SENT) {
      throw new BadRequestException(`Can only approve sent quotations`);
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        status: QuotationStatus.APPROVED,
      },
      include: {
        customer: true,
        motorcycle: {
          include: {
            owner: true,
          },
        },
        items: true,
      },
    });
  }

  async rejectQuotation(id: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    if (quotation.status !== QuotationStatus.SENT) {
      throw new BadRequestException(`Can only reject sent quotations`);
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        status: QuotationStatus.REJECTED,
      },
      include: {
        customer: true,
        motorcycle: {
          include: {
            owner: true,
          },
        },
        items: true,
      },
    });
  }

  async convertToJob(quotationId: number, symptom: string, userId: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        items: true,
        job: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }

    if (quotation.job) {
      throw new BadRequestException(
        'Quotation has already been converted to job',
      );
    }

    if (quotation.status !== QuotationStatus.APPROVED) {
      throw new BadRequestException(`Can only convert approved quotations`);
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.job.count({
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
    const jobNo = `JOB-${dateStr}-${runNo}`;

    const job = await this.prisma.job.create({
      data: {
        jobNo,
        motorcycleId: quotation.motorcycleId,
        quotationId: quotationId,
        receptionId: userId,
        symptom,
        jobType: JobType.NORMAL,
        status: JobStatus.PENDING,
      },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        quotation: {
          include: {
            items: true,
          },
        },
      },
    });

    return job;
  }

  async update(
    id: number,
    data: {
      items?: Array<{
        itemType: string;
        itemName: string;
        quantity: number;
        unitPrice: number;
        partId?: number;
        packageId?: number;
      }>;
      validUntil?: Date;
      notes?: string;
    },
  ) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Can only update draft quotations');
    }

    if (data.items) {
      await this.prisma.quotationItem.deleteMany({
        where: { quotationId: id },
      });

      await this.prisma.quotationItem.createMany({
        data: data.items.map((item) => ({
          quotationId: id,
          itemType: item.itemType,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          partId: item.partId || null,
          packageId: item.packageId || null,
        })),
      });
    }

    const updateData: any = {};
    if (data.validUntil) updateData.validUntil = data.validUntil;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return this.prisma.quotation.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        motorcycle: {
          include: {
            owner: true,
          },
        },
        items: true,
      },
    });
  }
}
