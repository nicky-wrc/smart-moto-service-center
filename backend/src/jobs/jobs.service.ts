import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, JobType, StockMovementType } from '@prisma/client';
import { ReturnPartsDto } from './dto/return-parts.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, userId: number) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `JOB-${dateStr}-`;

    // Find the highest existing jobNo for today to avoid unique constraint violations
    const lastJob = await this.prisma.job.findFirst({
      where: {
        jobNo: { startsWith: prefix },
      },
      orderBy: { jobNo: 'desc' },
      select: { jobNo: true },
    });

    let nextNum = 1;
    if (lastJob?.jobNo) {
      const lastNum = parseInt(lastJob.jobNo.replace(prefix, ''), 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const runNo = nextNum.toString().padStart(4, '0');
    const jobNo = `${prefix}${runNo}`;

    return this.prisma.job.create({
      data: {
        ...createJobDto,
        jobNo: jobNo,
        receptionId: userId,
        status: JobStatus.PENDING,
        images: createJobDto.images || [],
        tags: createJobDto.tags || [],
      },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    status?: JobStatus;
    jobType?: JobType;
    technicianId?: number;
    motorcycleId?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.jobType) {
      where.jobType = filters.jobType;
    }

    if (filters?.technicianId) {
      where.technicianId = filters.technicianId;
    }

    if (filters?.motorcycleId) {
      where.motorcycleId = filters.motorcycleId;
    }

    return this.prisma.job.findMany({
      where,
      include: {
        motorcycle: {
          include: {
            owner: true,
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
        appointment: {
          select: {
            id: true,
            appointmentNo: true,
            scheduledDate: true,
          },
        },
        quotation: {
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
      },
      orderBy: [{ jobType: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findOne(id: number) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        motorcycle: {
          include: {
            owner: true,
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
        appointment: true,
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
        checklistItems: true,
        outsources: true,
        payment: true,
        quotation: {
          include: {
            items: {
              include: {
                part: { select: { id: true, name: true } },
              },
            },
          },
        },
        partRequisitions: {
          include: {
            items: {
              include: {
                part: {
                  select: {
                    id: true,
                    name: true,
                    partNo: true,
                    unitPrice: true,
                    unit: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return this.prisma.job.update({
      where: { id },
      data: updateJobDto,
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        technician: true,
      },
    });
  }

  async assignTechnician(jobId: number, technicianId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.PAID ||
      job.status === JobStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot assign technician to job with status ${job.status}`,
      );
    }

    const technician = await this.prisma.user.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new BadRequestException(`User with ID ${technicianId} not found`);
    }

    if (technician.role !== 'TECHNICIAN' && technician.role !== 'FOREMAN') {
      throw new BadRequestException(
        `User ID ${technicianId} has role '${technician.role}'. Only TECHNICIAN or FOREMAN can be assigned to jobs.`,
      );
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        technicianId,
        ...(job.status === JobStatus.PENDING
          ? { status: JobStatus.PENDING }
          : {}),
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async startJob(jobId: number, technicianId?: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.status === JobStatus.IN_PROGRESS) {
      if (technicianId && job.technicianId !== technicianId) {
        return this.prisma.job.update({
          where: { id: jobId },
          data: {
            technicianId,
          },
          include: {
            technician: {
              select: {
                id: true,
                name: true,
              },
            },
            motorcycle: {
              include: {
                owner: true,
              },
            },
            reception: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }
      return this.prisma.job.findUnique({
        where: { id: jobId },
        include: {
          technician: {
            select: {
              id: true,
              name: true,
            },
          },
          motorcycle: {
            include: {
              owner: true,
            },
          },
          reception: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    if (
      job.status !== JobStatus.PENDING &&
      job.status !== JobStatus.WAITING_PARTS &&
      job.status !== JobStatus.READY
    ) {
      throw new BadRequestException(
        `Cannot start job with status ${job.status}. Job must be PENDING, READY or WAITING_PARTS to start.`,
      );
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.IN_PROGRESS,
        startedAt: new Date(),
        ...(technicianId ? { technicianId } : {}),
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async completeJob(
    jobId: number,
    diagnosisNotes?: string,
    mechanicNotes?: string,
    photos?: string[],
  ) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (
      job.status !== JobStatus.IN_PROGRESS &&
      job.status !== JobStatus.WAITING_PARTS
    ) {
      throw new BadRequestException(
        `Cannot complete job with status ${job.status}`,
      );
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.QC_PENDING,
        completedAt: new Date(),
        ...(diagnosisNotes ? { diagnosisNotes } : {}),
        ...(mechanicNotes ? { mechanicNotes } : {}),
        ...(photos && photos.length > 0 ? { images: { push: photos } } : {}),
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        motorcycle: {
          include: {
            owner: true,
          },
        },
        reception: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async cancelJob(jobId: number, reason?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.status === JobStatus.PAID || job.status === JobStatus.CANCELLED) {
      throw new BadRequestException(
        `Cannot cancel job with status ${job.status}`,
      );
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.CANCELLED,
        diagnosisNotes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
      },
    });
  }

  async getJobQueue(technicianId?: number) {
    const where: any = {
      status: {
        in: [JobStatus.PENDING, JobStatus.IN_PROGRESS, JobStatus.WAITING_PARTS],
      },
    };

    if (technicianId) {
      where.technicianId = technicianId;
    }

    return this.prisma.job.findMany({
      where,
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            appointmentNo: true,
            scheduledDate: true,
          },
        },
      },
      orderBy: [{ jobType: 'asc' }, { createdAt: 'asc' }],
    });
  }

  remove(id: number) {
    return this.prisma.job.delete({
      where: { id },
      include: {
        motorcycle: true,
      },
    });
  }

  async qcCheck(
    jobId: number,
    dto: { passed: boolean; notes?: string },
    _userId: number,
  ) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Job ID ${jobId} not found`);

    if (job.status !== JobStatus.QC_PENDING) {
      throw new BadRequestException(
        `Job is not pending QC. Current status: ${job.status}`,
      );
    }

    const nextStatus = dto.passed ? JobStatus.CLEANING : JobStatus.IN_PROGRESS;
    const notesAddition = dto.notes
      ? `\n[QC ${dto.passed ? 'PASSED' : 'FAILED'}]: ${dto.notes}`
      : `\n[QC ${dto.passed ? 'PASSED' : 'FAILED'}]`;

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: nextStatus,
        diagnosisNotes: job.diagnosisNotes
          ? job.diagnosisNotes + notesAddition
          : notesAddition.trim(),
        ...(dto.passed ? {} : { completedAt: null }), // Reset completedAt if failed
      },
      include: {
        technician: { select: { id: true, name: true, role: true } },
        motorcycle: { include: { owner: true } },
      },
    });
  }

  async readyForDelivery(
    jobId: number,
    dto: { photos?: string[]; notes?: string },
    _userId: number,
  ) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Job ID ${jobId} not found`);

    if (job.status !== JobStatus.CLEANING) {
      throw new BadRequestException(
        `Job is not in cleaning. Current status: ${job.status}`,
      );
    }

    const notesAddition = dto.notes
      ? `\n[Ready for Delivery]: ${dto.notes}`
      : '';

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.READY_FOR_DELIVERY,
        diagnosisNotes: job.diagnosisNotes
          ? job.diagnosisNotes + notesAddition
          : notesAddition.trim(),
        ...(dto.photos && dto.photos.length > 0
          ? { images: { push: dto.photos } }
          : {}),
      },
      include: {
        technician: { select: { id: true, name: true, role: true } },
        motorcycle: { include: { owner: true } },
      },
    });
  }

  async returnParts(jobId: number, dto: ReturnPartsDto, userId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        quotation: {
          include: {
            items: { include: { part: true } },
          },
        },
        partRequisitions: {
          where: { status: 'ISSUED' },
          include: {
            items: {
              include: {
                part: true,
              },
            },
          },
        },
      },
    });

    if (!job) throw new NotFoundException(`Job ID ${jobId} not found`);

    const hasQuotation = !!job.quotation;
    const quotationItems = job.quotation?.items ?? [];
    const requisitionItems = (job.partRequisitions ?? []).flatMap((r) =>
      r.items.map((i) => ({ ...i, requisitionNo: r.reqNo })),
    );

    return this.prisma.$transaction(async (tx) => {
      let totalAmountBeforeReturn = hasQuotation
        ? Number(job.quotation!.totalAmount)
        : 0;

      for (const returnItem of dto.partsActual) {
        if (returnItem.quotationItemId != null) {
          // Quotation item
          const quotationItem = quotationItems.find(
            (i) => i.id === returnItem.quotationItemId,
          );
          if (!quotationItem) {
            throw new BadRequestException(
              `Quotation item ID ${returnItem.quotationItemId} not found in this job`,
            );
          }
          const returnQuantity =
            quotationItem.quantity - returnItem.actualQuantity;
          if (returnQuantity > 0 && quotationItem.partId) {
            await tx.part.update({
              where: { id: quotationItem.partId },
              data: { stockQuantity: { increment: returnQuantity } },
            });
            await tx.stockMovement.create({
              data: {
                partId: quotationItem.partId,
                movementType: StockMovementType.RETURN,
                quantity: returnQuantity,
                unitPrice: quotationItem.unitPrice,
                reference: job.jobNo,
                notes: `ช่างทำเรื่องคืนอะไหล่จำนวน ${returnQuantity} ชิ้น จากใบงาน ${job.jobNo}`,
                createdById: userId,
              },
            });
          }
          const originalItemTotal = Number(quotationItem.totalPrice);
          const newItemTotal =
            returnItem.actualQuantity * Number(quotationItem.unitPrice);
          await tx.quotationItem.update({
            where: { id: quotationItem.id },
            data: {
              quantity: returnItem.actualQuantity,
              totalPrice: newItemTotal,
            },
          });
          totalAmountBeforeReturn =
            totalAmountBeforeReturn - originalItemTotal + newItemTotal;
          if (returnQuantity < 0) {
            throw new BadRequestException(
              `Cannot return negative quantity. Quotation item ID: ${returnItem.quotationItemId}`,
            );
          }
        } else if (returnItem.requisitionItemId != null) {
          // Part requisition item (อะไหล่เพิ่มเติม)
          const reqItem = requisitionItems.find(
            (i) => i.id === returnItem.requisitionItemId,
          );
          if (!reqItem) {
            throw new BadRequestException(
              `Requisition item ID ${returnItem.requisitionItemId} not found in this job`,
            );
          }
          const issuedQty = reqItem.issuedQuantity ?? reqItem.quantity;
          const returnQuantity = issuedQty - returnItem.actualQuantity;
          if (returnQuantity > 0 && reqItem.partId && reqItem.part) {
            await tx.part.update({
              where: { id: reqItem.partId },
              data: { stockQuantity: { increment: returnQuantity } },
            });
            await tx.stockMovement.create({
              data: {
                partId: reqItem.partId,
                movementType: StockMovementType.RETURN,
                quantity: returnQuantity,
                unitPrice: reqItem.part.unitPrice,
                reference: job.jobNo,
                notes: `ช่างทำเรื่องคืนอะไหล่จำนวน ${returnQuantity} ชิ้น จากใบงาน ${job.jobNo}`,
                createdById: userId,
              },
            });
          } else if (returnQuantity < 0) {
            throw new BadRequestException(
              `Cannot return negative quantity. Requisition item ID: ${returnItem.requisitionItemId}`,
            );
          }
        } else {
          throw new BadRequestException(
            'Each item must have quotationItemId or requisitionItemId',
          );
        }
      }

      if (hasQuotation) {
        await tx.quotation.update({
          where: { id: job.quotation!.id },
          data: { totalAmount: totalAmountBeforeReturn },
        });
      }

      return tx.job.findUnique({
        where: { id: jobId },
        include: {
          quotation: { include: { items: true } },
          partRequisitions: {
            where: { status: 'ISSUED' },
            include: { items: { include: { part: true } } },
          },
          technician: { select: { id: true, name: true, role: true } },
          motorcycle: { include: { owner: true } },
        },
      });
    });
  }

  // === Deep Inspection ===
  async requestInspection(
    jobId: number,
    dto: { inspectionFee: number; notes?: string },
  ) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Job ID ${jobId} not found`);

    if (
      job.status !== JobStatus.PENDING &&
      job.status !== JobStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        `Cannot request inspection for job with status ${job.status}`,
      );
    }

    const notesAddition = dto.notes
      ? `\n[ต้องตรวจสอบเชิงลึก]: ${dto.notes} (ค่าตรวจ: ${dto.inspectionFee} บาท)`
      : `\n[ต้องตรวจสอบเชิงลึก] (ค่าตรวจ: ${dto.inspectionFee} บาท)`;

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        jobType: JobType.DEEP_INSPECTION,
        status: JobStatus.WAITING_APPROVAL,
        inspectionFee: dto.inspectionFee,
        diagnosisNotes: job.diagnosisNotes
          ? job.diagnosisNotes + notesAddition
          : notesAddition.trim(),
      },
      include: {
        technician: { select: { id: true, name: true } },
        motorcycle: { include: { owner: true } },
      },
    });
  }

  // === Old Parts Tracking ===
  async createOldPart(
    jobId: number,
    data: {
      partName: string;
      description?: string;
      quantity?: number;
      action: string;
      photos?: string[];
      notes?: string;
    },
  ) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Job ID ${jobId} not found`);

    return this.prisma.oldPart.create({
      data: {
        jobId,
        partName: data.partName,
        description: data.description,
        quantity: data.quantity || 1,
        action: data.action as any,
        photos: data.photos || [],
        notes: data.notes,
      },
    });
  }

  async getOldParts(jobId: number) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Job ID ${jobId} not found`);

    return this.prisma.oldPart.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
