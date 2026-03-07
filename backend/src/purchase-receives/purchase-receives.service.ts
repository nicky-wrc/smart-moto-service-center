import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { POStatus, StockMovementType } from '@prisma/client';

@Injectable()
export class PurchaseReceivesService {
    constructor(private prisma: PrismaService) { }

    async create(
        userId: number,
        data: {
            purchaseOrderId: number;
            items: { purchaseOrderItemId: number; quantity: number }[];
            invoiceNo?: string;
            notes?: string;
        },
    ) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id: data.purchaseOrderId },
            include: { items: { include: { part: true } } },
        });

        if (!po) throw new NotFoundException(`PurchaseOrder ${data.purchaseOrderId} not found`);
        if (po.status !== 'ORDERED' && po.status !== 'PARTIAL_RECEIVED') {
            throw new BadRequestException('PO must be in ORDERED or PARTIAL_RECEIVED status to receive goods');
        }

        // Validate items
        for (const receiveItem of data.items) {
            const poItem = po.items.find((i) => i.id === receiveItem.purchaseOrderItemId);
            if (!poItem) {
                throw new BadRequestException(`PO Item ID ${receiveItem.purchaseOrderItemId} not found in this PO`);
            }
            const remaining = poItem.quantity - poItem.receivedQuantity;
            if (receiveItem.quantity > remaining) {
                throw new BadRequestException(
                    `Cannot receive ${receiveItem.quantity} for ${poItem.part.name}. Remaining: ${remaining}`,
                );
            }
        }

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.purchaseReceive.count({
            where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        });
        const receiveNo = `RCV-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create receive record
            const receive = await tx.purchaseReceive.create({
                data: {
                    receiveNo,
                    purchaseOrderId: data.purchaseOrderId,
                    receivedById: userId,
                    invoiceNo: data.invoiceNo,
                    notes: data.notes,
                    items: {
                        create: data.items.map((i) => {
                            const poItem = po.items.find((pi) => pi.id === i.purchaseOrderItemId)!;
                            return {
                                purchaseOrderItemId: i.purchaseOrderItemId,
                                quantity: i.quantity,
                                partId: poItem.partId,
                            };
                        }),
                    },
                },
                include: { items: { include: { poItem: { include: { part: true } } } } },
            });

            // 2. Update PO item received quantities + stock + movements
            for (const receiveItem of data.items) {
                const poItem = po.items.find((i) => i.id === receiveItem.purchaseOrderItemId)!;

                // Update PO item received quantity
                await tx.purchaseOrderItem.update({
                    where: { id: receiveItem.purchaseOrderItemId },
                    data: { receivedQuantity: { increment: receiveItem.quantity } },
                });

                // Add stock
                await tx.part.update({
                    where: { id: poItem.partId },
                    data: { stockQuantity: { increment: receiveItem.quantity } },
                });

                // Create stock movement
                await tx.stockMovement.create({
                    data: {
                        partId: poItem.partId,
                        movementType: StockMovementType.IN,
                        quantity: receiveItem.quantity,
                        unitPrice: poItem.unitPrice,
                        reference: `PO-${po.poNo} / RCV-${receiveNo}`,
                        notes: `รับสินค้าเข้าจาก PO ${po.poNo}`,
                        createdById: userId,
                    },
                });
            }

            // 3. Check if PO is fully received
            const updatedPO = await tx.purchaseOrder.findUnique({
                where: { id: data.purchaseOrderId },
                include: { items: true },
            });

            const allReceived = updatedPO!.items.every((i) => i.receivedQuantity >= i.quantity);

            await tx.purchaseOrder.update({
                where: { id: data.purchaseOrderId },
                data: {
                    status: allReceived ? POStatus.COMPLETED : POStatus.PARTIAL_RECEIVED,
                },
            });

            return receive;
        });
    }

    async findAll(filters?: { purchaseOrderId?: number; dateFrom?: Date; dateTo?: Date }) {
        const where: any = {};

        if (filters?.purchaseOrderId) where.purchaseOrderId = filters.purchaseOrderId;
        if (filters?.dateFrom || filters?.dateTo) {
            where.receiveDate = {};
            if (filters.dateFrom) where.receiveDate.gte = filters.dateFrom;
            if (filters.dateTo) where.receiveDate.lte = filters.dateTo;
        }

        return this.prisma.purchaseReceive.findMany({
            where,
            include: {
                purchaseOrder: { include: { supplier: true } },
                receivedBy: { select: { id: true, name: true } },
                items: { include: { poItem: { include: { part: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const receive = await this.prisma.purchaseReceive.findUnique({
            where: { id },
            include: {
                purchaseOrder: { include: { supplier: true } },
                receivedBy: { select: { id: true, name: true } },
                items: { include: { poItem: { include: { part: true } } } },
            },
        });
        if (!receive) throw new NotFoundException(`PurchaseReceive ${id} not found`);
        return receive;
    }
}
