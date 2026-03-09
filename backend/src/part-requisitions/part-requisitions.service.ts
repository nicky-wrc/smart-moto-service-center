import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartRequisitionStatus, StockMovementType } from '@prisma/client';

@Injectable()
export class PartRequisitionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(filters?: { status?: PartRequisitionStatus; jobId?: number }) {
        return this.prisma.partRequisition.findMany({
            where: filters,
            include: {
                job: true,
                requestedBy: { select: { id: true, name: true } },
                items: { include: { part: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const req = await this.prisma.partRequisition.findUnique({
            where: { id },
            include: {
                job: true,
                requestedBy: { select: { id: true, name: true } },
                items: { include: { part: true } },
            },
        });

        if (!req) throw new NotFoundException(`Part Requisition ${id} not found`);
        return req;
    }

    async issueParts(id: number, userId: number, dto: { notes?: string, issuedItems?: { id: number, issuedQuantity: number }[] }) {
        const req = await this.prisma.partRequisition.findUnique({
            where: { id },
            include: { items: { include: { part: true } } },
        });

        if (!req) throw new NotFoundException(`Part Requisition ${id} not found`);
        if (req.status === PartRequisitionStatus.ISSUED) {
            throw new BadRequestException('Parts already issued for this requisition.');
        }

        // Checking stock availability before transaction
        for (const item of req.items) {
            const requestedQty = dto.issuedItems?.find(i => i.id === item.id)?.issuedQuantity ?? item.requestedQuantity;
            if (item.part && item.part.stockQuantity < requestedQty) {
                throw new BadRequestException(
                    `Insufficient stock for Part: ${item.part.name} (Available: ${item.part.stockQuantity}, Requested: ${requestedQty})`,
                );
            }
        }

        // DB Transaction: Update requisition status, deduct part stocks, and create log movement
        return this.prisma.$transaction(async (tx) => {
            for (const item of req.items) {
                const issuedQty = dto.issuedItems?.find(i => i.id === item.id)?.issuedQuantity ?? item.requestedQuantity;
                if (item.part && issuedQty > 0) {
                    // 1. Deduct Stock
                    await tx.part.update({
                        where: { id: item.partId as number },
                        data: { stockQuantity: { decrement: issuedQty } },
                    });

                    // 2. Create Movement Log (OUT)
                    await tx.stockMovement.create({
                        data: {
                            partId: item.partId as number,
                            movementType: StockMovementType.OUT,
                            quantity: issuedQty,
                            unitPrice: item.part.unitPrice,
                            reference: `REQ-${req.reqNo}`,
                            notes: 'ช่างเบิกอะไหล่ซ่อมรถ',
                            createdById: userId,
                        },
                    });

                    // 3. Update Item Issued Quantity = Requested Quantity
                    await tx.partRequisitionItem.update({
                        where: { id: item.id },
                        data: { issuedQuantity: issuedQty },
                    });
                } else if (issuedQty === 0) {
                    await tx.partRequisitionItem.update({
                        where: { id: item.id },
                        data: { issuedQuantity: 0 },
                    });
                }
            }

            // 4. Update Requisition Status to ISSUED
            return tx.partRequisition.update({
                where: { id },
                data: {
                    status: PartRequisitionStatus.ISSUED,
                    issuedAt: new Date(),
                    notes: dto.notes ? `${req.notes || ''}\n[Issue Note]: ${dto.notes}` : req.notes,
                },
                include: { items: true },
            });
        });
    }

    async rejectRequest(id: number, userId: number, notes?: string) {
        const req = await this.prisma.partRequisition.findUnique({
            where: { id },
        });

        if (!req) throw new NotFoundException(`Part Requisition ${id} not found`);
        if (req.status !== PartRequisitionStatus.PENDING) {
            throw new BadRequestException(`Cannot reject requisition with status ${req.status}`);
        }

        return this.prisma.partRequisition.update({
            where: { id },
            data: {
                status: PartRequisitionStatus.REJECTED,
                notes: notes ? `${req.notes || ''}\n[Reject Note]: ${notes}` : req.notes,
            },
            include: { items: true },
        });
    }

    async requestParts(userId: number, dto: { jobId: number; notes?: string; items: { partId: number; quantity: number }[] }) {
        const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
        if (!job) throw new NotFoundException(`Job ID ${dto.jobId} not found`);

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const reqCount = await this.prisma.partRequisition.count({
            where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        });
        const reqNo = `REQ-${dateStr}-${(reqCount + 1).toString().padStart(4, '0')}`;

        return this.prisma.partRequisition.create({
            data: {
                reqNo,
                jobId: dto.jobId,
                requestedById: userId,
                status: PartRequisitionStatus.PENDING,
                notes: dto.notes ? `[เบิกเพิ่มโดยช่าง] ${dto.notes}` : '[เบิกเพิ่มโดยช่าง]',
                items: {
                    create: dto.items.map(i => ({
                        partId: i.partId,
                        quantity: i.quantity,
                        requestedQuantity: i.quantity,
                    })),
                }
            },
            include: { items: true },
        });
    }

    async returnParts(userId: number, dto: { requisitionId: number; items: { partId: number; returnQuantity: number }[] }) {
        const req = await this.prisma.partRequisition.findUnique({
            where: { id: dto.requisitionId },
            include: { items: { include: { part: true } } },
        });

        if (!req) throw new NotFoundException(`Part Requisition ${dto.requisitionId} not found`);
        if (req.status !== PartRequisitionStatus.ISSUED) {
            throw new BadRequestException('Only issued requisitions can have parts returned');
        }

        return this.prisma.$transaction(async (tx) => {
            let totalReturned = 0;
            for (const returnItem of dto.items) {
                const reqItem = req.items.find(i => i.partId === returnItem.partId);

                if (!reqItem) {
                    throw new BadRequestException(`Part ID ${returnItem.partId} was not in this requisition`);
                }

                if (returnItem.returnQuantity > reqItem.issuedQuantity) {
                    throw new BadRequestException(`Cannot return ${returnItem.returnQuantity}. Only ${reqItem.issuedQuantity} was issued.`);
                }

                if (reqItem.part) {
                    await tx.part.update({
                        where: { id: returnItem.partId },
                        data: { stockQuantity: { increment: returnItem.returnQuantity } },
                    });

                    await tx.stockMovement.create({
                        data: {
                            partId: returnItem.partId,
                            movementType: StockMovementType.RETURN,
                            quantity: returnItem.returnQuantity,
                            unitPrice: reqItem.part.unitPrice,
                            reference: `RET-${req.reqNo}`,
                            notes: 'ช่างคืนอะไหล่เบิกเกิน/ไม่ได้ใช้',
                            createdById: userId,
                        },
                    });

                    await tx.partRequisitionItem.update({
                        where: { id: reqItem.id },
                        data: { issuedQuantity: { decrement: returnItem.returnQuantity } },
                    });

                    totalReturned++;
                }
            }

            return { message: `Successfully returned ${totalReturned} parts to stock.` };
        });
    }
}
