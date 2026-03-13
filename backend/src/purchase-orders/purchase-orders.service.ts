import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { POStatus } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    data: {
      supplierId: number;
      items: { partId: number; quantity: number; unitPrice: number }[];
      notes?: string;
      expectedDate?: Date;
    },
  ) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    if (!supplier)
      throw new NotFoundException(`Supplier ${data.supplierId} not found`);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // หาเลขรันล่าสุดของวันนั้นจาก poNo ปัจจุบัน แล้ว +1 เพื่อเลี่ยงชนกับข้อมูลเก่า
    const latestToday = await this.prisma.purchaseOrder.findFirst({
      where: {
        poNo: {
          startsWith: `PO-${dateStr}-`,
        },
      },
      orderBy: { poNo: 'desc' },
      select: { poNo: true },
    });

    let nextSeq = 1;
    if (latestToday?.poNo) {
      const parts = latestToday.poNo.split('-');
      const last = parts[2];
      const parsed = parseInt(last, 10);
      if (!Number.isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    const poNo = `PO-${dateStr}-${nextSeq.toString().padStart(4, '0')}`;

    const totalAmount = data.items.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice,
      0,
    );

    return this.prisma.purchaseOrder.create({
      data: {
        poNo,
        supplierId: data.supplierId,
        createdById: userId,
        totalAmount,
        notes: data.notes,
        expectedDate: data.expectedDate,
        items: {
          create: data.items.map((i) => ({
            partId: i.partId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.quantity * i.unitPrice,
          })),
        },
      },
      include: { items: { include: { part: true } }, supplier: true },
    });
  }

  async findAll(filters?: {
    status?: POStatus;
    supplierId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.supplierId) where.supplierId = filters.supplierId;
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        items: { include: { part: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        items: { include: { part: true } },
        receives: {
          include: {
            items: true,
            receivedBy: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!po) throw new NotFoundException(`PurchaseOrder ${id} not found`);
    return po;
  }

  async update(
    id: number,
    data: {
      items?: { partId: number; quantity: number; unitPrice: number }[];
      notes?: string;
      expectedDate?: Date;
    },
  ) {
    const po = await this.findOne(id);
    if (po.status !== POStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT PO can be edited');
    }

    const updateData: any = {};
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.expectedDate) updateData.expectedDate = data.expectedDate;

    if (data.items) {
      const totalAmount = data.items.reduce(
        (sum, i) => sum + i.quantity * i.unitPrice,
        0,
      );
      updateData.totalAmount = totalAmount;

      // Delete old items and re-create
      await this.prisma.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });
      updateData.items = {
        create: data.items.map((i) => ({
          partId: i.partId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.quantity * i.unitPrice,
        })),
      };
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: { items: { include: { part: true } }, supplier: true },
    });
  }

  async submit(id: number) {
    const po = await this.findOne(id);
    if (po.status !== POStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT PO can be submitted');
    }

    // All POs need owner approval regardless of total amount
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.PENDING_APPROVAL },
      include: { items: { include: { part: true } }, supplier: true },
    });
  }

  async approve(id: number, userId: number) {
    const po = await this.findOne(id);
    if (po.status !== POStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only PENDING_APPROVAL PO can be approved');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update PO status to COMPLETED (since we auto-receive fully)
      const updatedPO = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: POStatus.COMPLETED,
          approvedById: userId,
          orderedAt: new Date(),
        },
        include: { items: { include: { part: true } }, supplier: true },
      });

      // 2. Auto-create Receive record
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = await tx.purchaseReceive.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      });
      const receiveNo = `RCV-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

      await tx.purchaseReceive.create({
        data: {
          receiveNo,
          purchaseOrderId: id,
          receivedById: userId,
          notes: 'Auto-received upon PO approval',
          items: {
            create: po.items.map((poItem) => ({
              purchaseOrderItemId: poItem.id,
              quantity: poItem.quantity,
              partId: poItem.partId,
            })),
          },
        },
      });

      // 3. Update PO items received quantities + stock + movements
      for (const poItem of po.items) {
        // Update PO item received quantity
        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: { receivedQuantity: poItem.quantity },
        });

        // Add stock
        await tx.part.update({
          where: { id: poItem.partId },
          data: { stockQuantity: { increment: poItem.quantity } },
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            partId: poItem.partId,
            movementType: 'IN',
            quantity: poItem.quantity,
            unitPrice: poItem.unitPrice,
            reference: `PO-${po.poNo} / RCV-${receiveNo}`,
            notes: `รับสินค้าอัตโนมัติจากการอนุมัติ PO ${po.poNo}`,
            createdById: userId,
          },
        });
      }

      return updatedPO;
    });
  }

  async cancel(id: number) {
    const po = await this.findOne(id);
    if (po.status === 'COMPLETED' || po.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot cancel a completed or already cancelled PO',
      );
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.CANCELLED },
      include: { items: { include: { part: true } }, supplier: true },
    });
  }
}
