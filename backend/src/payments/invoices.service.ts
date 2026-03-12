import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, PaymentStatus } from '@prisma/client';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto, _userId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
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
          where: {
            status: 'ISSUED',
          },
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

    if (!job) {
      throw new NotFoundException(`Job with ID ${dto.jobId} not found`);
    }

    if (job.status !== JobStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot create invoice for job with status ${job.status}. Job must be completed first.`,
      );
    }

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { jobId: dto.jobId },
    });

    if (existingPayment) {
      // Return existing payment as invoice
      return this.findOne(existingPayment.id);
    }

    // Calculate costs
    // Labor cost
    let laborCost = 0;
    for (const lt of job.laborTimes) {
      laborCost += Number(lt.laborCost || 0);
    }

    // Parts cost
    let partsCost = 0;
    for (const req of job.partRequisitions) {
      for (const item of req.items) {
        if (item.partId && item.issuedQuantity > 0) {
          const part = item.part;
          if (part) {
            partsCost += Number(part.unitPrice) * item.issuedQuantity;
          }
        } else if (item.packageId && item.issuedQuantity > 0) {
          const package_ = item.package;
          if (package_) {
            for (const packageItem of package_.items) {
              const part = packageItem.part;
              if (part) {
                const totalQty = packageItem.quantity * item.issuedQuantity;
                partsCost += Number(part.unitPrice) * totalQty;
              }
            }
          }
        }
      }
    }

    // Outsource cost
    const outsourceCost = job.outsources.reduce(
      (sum, o) => sum + Number(o.sellingPrice),
      0,
    );

    // Calculate totals
    const subtotal = laborCost + partsCost + outsourceCost;
    const vat = subtotal * 0.07; // 7% VAT
    const totalAmount = subtotal + vat;
    const pointsEarned = Math.floor(totalAmount / 100); // 1 point per 100 baht

    // Create payment (which acts as invoice)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.payment.count({
      where: {
        paymentNo: { startsWith: `INV-${dateStr}` },
      },
    });
    const runNo = (count + 1).toString().padStart(4, '0');
    const invoiceNo = `INV-${dateStr}-${runNo}`;

    const payment = await this.prisma.payment.create({
      data: {
        paymentNo: invoiceNo,
        jobId: dto.jobId,
        customerId: job.motorcycle.ownerId,
        subtotal,
        discount: 0,
        pointsUsed: 0,
        pointsEarned,
        vat,
        totalAmount,
        paymentMethod: 'CASH', // Default, can be updated later
        paymentStatus: PaymentStatus.PENDING,
        notes: dto.notes,
      },
      include: {
        job: {
          include: {
            motorcycle: {
              include: {
                owner: true,
              },
            },
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
              where: {
                status: 'ISSUED',
              },
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
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            address: true,
          },
        },
      },
    });

    return payment;
  }

  async findAll(filters?: {
    dateFrom?: string;
    dateTo?: string;
    customerId?: number;
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

    if (filters?.customerId) {
      where.customerId = filters.customerId;
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
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
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
              where: {
                status: 'ISSUED',
              },
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
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            address: true,
            taxId: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Invoice/Payment with ID ${id} not found`);
    }

    return payment;
  }
}
