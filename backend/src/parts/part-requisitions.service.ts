import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartRequisitionStatus, StockMovementType } from '@prisma/client';
import { ApproveRequisitionDto } from './dto/approve-requisition.dto';
import { IssueRequisitionDto } from './dto/issue-requisition.dto';
import { CreateRequisitionDto } from './dto/create-requisition.dto';

@Injectable()
export class PartRequisitionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRequisitionDto, userId: number) {
    // Generate requisition number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.partRequisition.count({
      where: {
        reqNo: { startsWith: `REQ-${dateStr}` },
      },
    });
    const runNo = (count + 1).toString().padStart(4, '0');
    const reqNo = `REQ-${dateStr}-${runNo}`;

    // Validate items
    for (const item of dto.items) {
      if (!item.partId && !item.packageId) {
        throw new BadRequestException(
          'Each item must have either partId or packageId',
        );
      }

      if (item.partId && item.packageId) {
        throw new BadRequestException(
          'Item cannot have both partId and packageId',
        );
      }

      // Verify part or package exists
      if (item.partId) {
        const part = await this.prisma.part.findUnique({
          where: { id: item.partId },
        });
        if (!part) {
          throw new NotFoundException(`Part with ID ${item.partId} not found`);
        }
      }

      if (item.packageId) {
        const package_ = await this.prisma.partPackage.findUnique({
          where: { id: item.packageId },
        });
        if (!package_) {
          throw new NotFoundException(
            `Package with ID ${item.packageId} not found`,
          );
        }
      }
    }

    // Create requisition with items
    return this.prisma.partRequisition.create({
      data: {
        reqNo,
        jobId: dto.jobId,
        requestedById: userId,
        status: PartRequisitionStatus.PENDING,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            partId: item.partId,
            packageId: item.packageId,
            quantity: item.quantity,
            requestedQuantity: item.quantity,
            notes: item.notes,
          })),
        },
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
        requestedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        items: {
          include: {
            part: {
              select: {
                id: true,
                partNo: true,
                name: true,
                stockQuantity: true,
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
    });
  }

  async findAll(filters?: {
    status?: PartRequisitionStatus;
    jobId?: number;
    technicianId?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.jobId) {
      where.jobId = filters.jobId;
    }

    if (filters?.technicianId) {
      where.requestedById = filters.technicianId;
    }

    return this.prisma.partRequisition.findMany({
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
        requestedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        items: {
          include: {
            part: {
              select: {
                id: true,
                partNo: true,
                name: true,
                stockQuantity: true,
                unit: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const requisition = await this.prisma.partRequisition.findUnique({
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
        requestedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        items: {
          include: {
            part: {
              select: {
                id: true,
                partNo: true,
                name: true,
                stockQuantity: true,
                unit: true,
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
                        stockQuantity: true,
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

    if (!requisition) {
      throw new NotFoundException(`Part Requisition with ID ${id} not found`);
    }

    return requisition;
  }

  async approve(id: number, dto: ApproveRequisitionDto, userId: number) {
    const requisition = await this.prisma.partRequisition.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            part: true,
            package: {
              include: {
                items: {
                  include: {
                    part: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!requisition) {
      throw new NotFoundException(`Part Requisition with ID ${id} not found`);
    }

    if (requisition.status !== PartRequisitionStatus.PENDING) {
      throw new BadRequestException(
        `Can only approve PENDING requisitions. Current status: ${requisition.status}`,
      );
    }

    // Check stock availability
    for (const item of requisition.items) {
      if (item.partId) {
        // Single part
        const part = item.part;
        if (!part) {
          throw new NotFoundException(`Part with ID ${item.partId} not found`);
        }

        if (part.stockQuantity < item.requestedQuantity) {
          throw new BadRequestException(
            `Insufficient stock for part ${part.partNo}: Available ${part.stockQuantity}, Required ${item.requestedQuantity}`,
          );
        }
      } else if (item.packageId) {
        // Package - check all parts in package
        const package_ = item.package;
        if (!package_) {
          throw new NotFoundException(
            `Package with ID ${item.packageId} not found`,
          );
        }

        for (const packageItem of package_.items) {
          const part = packageItem.part;
          const requiredQuantity =
            packageItem.quantity * item.requestedQuantity;

          if (part.stockQuantity < requiredQuantity) {
            throw new BadRequestException(
              `Insufficient stock for package ${package_.name}: Part ${part.partNo} - Available ${part.stockQuantity}, Required ${requiredQuantity}`,
            );
          }
        }
      }
    }

    // Update status to APPROVED
    return this.prisma.partRequisition.update({
      where: { id },
      data: {
        status: PartRequisitionStatus.APPROVED,
        approvedAt: new Date(),
        notes: dto.notes || requisition.notes,
      },
      include: {
        items: {
          include: {
            part: true,
            package: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async reject(id: number, reason: string, userId: number) {
    const requisition = await this.prisma.partRequisition.findUnique({
      where: { id },
    });

    if (!requisition) {
      throw new NotFoundException(`Part Requisition with ID ${id} not found`);
    }

    if (requisition.status !== PartRequisitionStatus.PENDING) {
      throw new BadRequestException(
        `Can only reject PENDING requisitions. Current status: ${requisition.status}`,
      );
    }

    return this.prisma.partRequisition.update({
      where: { id },
      data: {
        status: PartRequisitionStatus.REJECTED,
        notes: reason,
      },
      include: {
        items: {
          include: {
            part: true,
            package: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async issue(id: number, dto: IssueRequisitionDto, userId: number) {
    const requisition = await this.prisma.partRequisition.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            part: true,
            package: {
              include: {
                items: {
                  include: {
                    part: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!requisition) {
      throw new NotFoundException(`Part Requisition with ID ${id} not found`);
    }

    if (requisition.status !== PartRequisitionStatus.APPROVED) {
      throw new BadRequestException(
        `Can only issue APPROVED requisitions. Current status: ${requisition.status}`,
      );
    }

    // Create a map of item updates
    const itemUpdates = new Map(
      dto.items.map((item) => [item.itemId, item]),
    );

    // Process each requisition item
    for (const reqItem of requisition.items) {
      const update = itemUpdates.get(reqItem.id);
      if (!update) {
        continue; // Skip if not in update list
      }

      const issuedQty = update.issuedQuantity;

      if (reqItem.partId) {
        // Issue single part
        const part = reqItem.part;
        if (!part) {
          throw new NotFoundException(
            `Part with ID ${reqItem.partId} not found`,
          );
        }

        if (part.stockQuantity < issuedQty) {
          throw new BadRequestException(
            `Insufficient stock for part ${part.partNo}: Available ${part.stockQuantity}, Required ${issuedQty}`,
          );
        }

        // Create stock movement
        await this.prisma.stockMovement.create({
          data: {
            partId: reqItem.partId,
            movementType: StockMovementType.OUT,
            quantity: issuedQty,
            unitPrice: part.unitPrice,
            reference: requisition.reqNo,
            notes: `Issued from requisition ${requisition.reqNo}${update.notes ? `, ${update.notes}` : ''}`,
            createdById: userId,
          },
        });

        // Update part stock
        await this.prisma.part.update({
          where: { id: reqItem.partId },
          data: {
            stockQuantity: {
              decrement: issuedQty,
            },
          },
        });

        // Update requisition item
        await this.prisma.partRequisitionItem.update({
          where: { id: reqItem.id },
          data: {
            issuedQuantity: issuedQty,
            notes: update.notes || reqItem.notes,
          },
        });
      } else if (reqItem.packageId) {
        // Issue package - issue all parts in package
        const package_ = reqItem.package;
        if (!package_) {
          throw new NotFoundException(
            `Package with ID ${reqItem.packageId} not found`,
          );
        }

        for (const packageItem of package_.items) {
          const part = packageItem.part;
          const totalQuantity = packageItem.quantity * issuedQty;

          if (part.stockQuantity < totalQuantity) {
            throw new BadRequestException(
              `Insufficient stock for package ${package_.name}: Part ${part.partNo} - Available ${part.stockQuantity}, Required ${totalQuantity}`,
            );
          }

          // Create stock movement for each part in package
          await this.prisma.stockMovement.create({
            data: {
              partId: part.id,
              movementType: StockMovementType.OUT,
              quantity: totalQuantity,
              unitPrice: part.unitPrice,
              reference: requisition.reqNo,
              notes: `Issued from package requisition ${requisition.reqNo}${update.notes ? `, ${update.notes}` : ''}`,
              createdById: userId,
            },
          });

          // Update part stock
          await this.prisma.part.update({
            where: { id: part.id },
            data: {
              stockQuantity: {
                decrement: totalQuantity,
              },
            },
          });
        }

        // Update requisition item
        await this.prisma.partRequisitionItem.update({
          where: { id: reqItem.id },
          data: {
            issuedQuantity: issuedQty,
            notes: update.notes || reqItem.notes,
          },
        });
      }
    }

    // Update requisition status to ISSUED
    return this.prisma.partRequisition.update({
      where: { id },
      data: {
        status: PartRequisitionStatus.ISSUED,
        issuedAt: new Date(),
        notes: dto.notes || requisition.notes,
      },
      include: {
        items: {
          include: {
            part: true,
            package: {
              include: {
                items: {
                  include: {
                    part: true,
                  },
                },
              },
            },
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
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
  }
}
