import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ForemanResponseStatus, PartRequisitionStatus } from '@prisma/client';
import { CreateForemanResponseDto } from './dto/create-foreman-response.dto';
import { UpdateForemanResponseDto } from './dto/update-foreman-response.dto';
import { QueryForemanResponseDto } from './dto/query-foreman-response.dto';
import {
  CustomerDecision,
  UpdateCustomerDecisionDto,
} from './dto/update-customer-decision.dto';

@Injectable()
export class ForemanResponsesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new foreman response
   */
  async create(createDto: CreateForemanResponseDto) {
    const { requiredParts, ...responseData } = createDto;

    // Verify job exists
    const job = await this.prisma.job.findUnique({
      where: { id: createDto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${createDto.jobId} not found`);
    }

    // Create foreman response with required parts
    const foremanResponse = await this.prisma.foremanResponse.create({
      data: {
        ...responseData,
        requiredParts: {
          create: requiredParts,
        },
      },
      include: {
        requiredParts: {
          include: {
            part: true,
          },
        },
        foreman: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
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

    return foremanResponse;
  }

  /**
   * Get all foreman responses with pagination and filters
   */
  async findAll(query: QueryForemanResponseDto) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'respondedAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { job: { jobNo: { contains: search, mode: 'insensitive' } } },
        {
          job: {
            motorcycle: {
              owner: { firstName: { contains: search, mode: 'insensitive' } },
            },
          },
        },
        {
          job: {
            motorcycle: {
              owner: { lastName: { contains: search, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    if (dateFrom || dateTo) {
      where.respondedAt = {};
      if (dateFrom) where.respondedAt.gte = new Date(dateFrom);
      if (dateTo) where.respondedAt.lte = new Date(dateTo);
    }

    // Get total count
    const total = await this.prisma.foremanResponse.count({ where });

    // Get data
    const data = await this.prisma.foremanResponse.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        requiredParts: {
          include: {
            part: true,
          },
        },
        foreman: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        job: {
          include: {
            motorcycle: {
              include: {
                owner: true,
              },
            },
          },
        },
        decisionBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single foreman response by ID
   */
  async findOne(id: number) {
    const foremanResponse = await this.prisma.foremanResponse.findUnique({
      where: { id },
      include: {
        requiredParts: {
          include: {
            part: true,
          },
        },
        foreman: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        job: {
          include: {
            motorcycle: {
              include: {
                owner: true,
              },
            },
          },
        },
        decisionBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!foremanResponse) {
      throw new NotFoundException(`Foreman response with ID ${id} not found`);
    }

    return foremanResponse;
  }

  /**
   * Get foreman responses by job ID
   */
  async findByJobId(jobId: number) {
    const foremanResponses = await this.prisma.foremanResponse.findMany({
      where: { jobId },
      include: {
        requiredParts: {
          include: {
            part: true,
          },
        },
        foreman: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        decisionBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { assessmentNumber: 'desc' },
    });

    return foremanResponses;
  }

  /**
   * Get pending foreman responses (waiting for customer decision)
   */
  async findPending() {
    return this.prisma.foremanResponse.findMany({
      where: {
        status: 'PENDING_CUSTOMER',
      },
      include: {
        requiredParts: true,
        foreman: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
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
      orderBy: { respondedAt: 'asc' },
    });
  }

  /**
   * Update customer decision (approve/reject)
   */
  async updateCustomerDecision(
    id: number,
    updateDto: UpdateCustomerDecisionDto,
  ) {
    const foremanResponse = await this.prisma.foremanResponse.findUnique({
      where: { id },
    });

    if (!foremanResponse) {
      throw new NotFoundException(`Foreman response with ID ${id} not found`);
    }

    if (foremanResponse.status !== 'PENDING_CUSTOMER') {
      throw new BadRequestException('Customer decision has already been made');
    }

    // Map decision to status
    const status =
      updateDto.decision === CustomerDecision.APPROVED
        ? ForemanResponseStatus.APPROVED
        : ForemanResponseStatus.REJECTED;

    const updated = await this.prisma.foremanResponse.update({
      where: { id },
      data: {
        customerDecision: updateDto.decision,
        customerDecisionAt: new Date(),
        decisionByUserId: updateDto.decisionByUserId,
        decisionNotes: updateDto.notes,
        status,
      },
      include: {
        requiredParts: true,
        foreman: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        job: {
          include: {
            motorcycle: {
              include: {
                owner: true,
              },
            },
          },
        },
        decisionBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    // Auto-generate Part Requisition if APPROVED and has parts
    if (
      status === 'APPROVED' &&
      updated.requiredParts &&
      updated.requiredParts.length > 0
    ) {
      const partsToRequest = updated.requiredParts.filter(
        (part) => part.partId !== null,
      );

      if (partsToRequest.length > 0) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const reqCount = await this.prisma.partRequisition.count({
          where: {
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        });
        const reqNo = `REQ-${dateStr}-${(reqCount + 1).toString().padStart(4, '0')}`;

        await this.prisma.partRequisition.create({
          data: {
            reqNo,
            jobId: updated.jobId,
            requestedById: updated.foremanId, // คนที่เพิ่มรายการประเมินคือคนขอเบิก
            status: PartRequisitionStatus.PENDING,
            notes: `Auto-generated from Foreman Assessment (Job: ${updated.job.jobNo})`,
            items: {
              create: partsToRequest.map((item) => ({
                partId: item.partId as number,
                quantity: item.quantity,
                requestedQuantity: item.quantity,
              })),
            },
          },
        });
      }
    }

    // TODO: Notify foreman about customer decision

    return {
      success: true,
      message: `Customer ${updateDto.decision === CustomerDecision.APPROVED ? 'approved' : 'rejected'} the quotation`,
      data: updated,
    };
  }

  /**
   * Update foreman response
   */
  async update(id: number, updateDto: UpdateForemanResponseDto) {
    const foremanResponse = await this.prisma.foremanResponse.findUnique({
      where: { id },
    });

    if (!foremanResponse) {
      throw new NotFoundException(`Foreman response with ID ${id} not found`);
    }

    const { requiredParts, ...responseData } = updateDto;

    const updated = await this.prisma.foremanResponse.update({
      where: { id },
      data: {
        ...responseData,
        ...(requiredParts && {
          requiredParts: {
            deleteMany: {},
            create: requiredParts,
          },
        }),
      },
      include: {
        requiredParts: true,
        foreman: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
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

    return updated;
  }

  /**
   * Delete foreman response
   */
  async remove(id: number) {
    const foremanResponse = await this.prisma.foremanResponse.findUnique({
      where: { id },
    });

    if (!foremanResponse) {
      throw new NotFoundException(`Foreman response with ID ${id} not found`);
    }

    await this.prisma.foremanResponse.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Foreman response deleted successfully',
    };
  }

  /**
   * Get statistics
   */
  async getStats() {
    const [pending, approved, rejected, total] = await Promise.all([
      this.prisma.foremanResponse.count({
        where: { status: 'PENDING_CUSTOMER' },
      }),
      this.prisma.foremanResponse.count({ where: { status: 'APPROVED' } }),
      this.prisma.foremanResponse.count({ where: { status: 'REJECTED' } }),
      this.prisma.foremanResponse.count(),
    ]);

    return {
      pending,
      approved,
      rejected,
      total,
    };
  }
}
