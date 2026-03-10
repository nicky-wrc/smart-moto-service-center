import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { StockMovementType } from '@prisma/client';

@Injectable()
export class PartsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    partNo: string;
    name: string;
    description?: string;
    brand?: string;
    category?: string;
    unit?: string;
    unitPrice: number;
    stockQuantity?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
  }) {
    return this.prisma.part.create({
      data: {
        partNo: data.partNo,
        name: data.name,
        description: data.description,
        brand: data.brand,
        category: data.category,
        unit: data.unit || 'ชิ้น',
        unitPrice: data.unitPrice,
        stockQuantity: data.stockQuantity || 0,
        reorderPoint: data.reorderPoint || 0,
        reorderQuantity: data.reorderQuantity || 0,
        isActive: true,
      },
    });
  }

  async findAll(filters?: {
    category?: string;
    brand?: string;
    isActive?: boolean;
    lowStock?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.brand) {
      where.brand = filters.brand;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.lowStock) {
      where.stockQuantity = { lte: this.prisma.part.fields.reorderPoint };
    }

    if (filters?.search) {
      where.OR = [
        { partNo: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.part.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByPartNo(partNo: string) {
    const part = await this.prisma.part.findUnique({
      where: { partNo },
    });

    if (!part) {
      throw new NotFoundException(`Part with partNo ${partNo} not found`);
    }

    return part;
  }

  async findOne(id: number) {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return part;
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      brand?: string;
      category?: string;
      unit?: string;
      unitPrice?: number;
      reorderPoint?: number;
      reorderQuantity?: number;
      isActive?: boolean;
    },
  ) {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return this.prisma.part.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return this.prisma.part.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async adjustStock(
    id: number,
    quantity: number,
    notes?: string,
    userId?: number,
  ) {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    const newStockQuantity = part.stockQuantity + quantity;

    if (newStockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    await this.prisma.stockMovement.create({
      data: {
        partId: id,
        movementType: quantity > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(quantity),
        notes: notes || 'Stock adjustment',
        ...(userId ? { createdById: userId } : {}),
      },
    });

    return this.prisma.part.update({
      where: { id },
      data: { stockQuantity: newStockQuantity },
    });
  }

  async getLowStock() {
    const parts = await this.prisma.part.findMany({
      where: {
        isActive: true,
        stockQuantity: {
          lte: this.prisma.part.fields.reorderPoint,
        },
      },
      orderBy: {
        stockQuantity: 'asc',
      },
    });

    return parts;
  }

  async createReceipt(dto: CreateReceiptDto, userId: number) {
    // Generate receipt number if not provided
    let receiptNo = dto.receiptNo;
    if (!receiptNo) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = await this.prisma.stockMovement.count({
        where: {
          reference: { startsWith: `GR-${dateStr}` },
        },
      });
      const runNo = (count + 1).toString().padStart(4, '0');
      receiptNo = `GR-${dateStr}-${runNo}`;
    }

    const receiptDate = new Date(dto.receiptDate);

    // Process each item
    const results: Array<{
      partId: number;
      partNo: string;
      partName: string;
      quantity: number;
      unitPrice: number;
      stockMovement: any;
      updatedStock: number;
    }> = [];
    for (const item of dto.items) {
      // Verify part exists
      const part = await this.prisma.part.findUnique({
        where: { id: item.partId },
      });

      if (!part) {
        throw new NotFoundException(`Part with ID ${item.partId} not found`);
      }

      // Create stock movement
      const stockMovement = await this.prisma.stockMovement.create({
        data: {
          partId: item.partId,
          movementType: StockMovementType.IN,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          reference: receiptNo,
          notes: `Goods Receipt: ${dto.supplierName}${item.batchNo ? `, Batch: ${item.batchNo}` : ''}${item.notes ? `, ${item.notes}` : ''}`,
          createdById: userId,
        },
      });

      // Update part stock
      const updatedPart = await this.prisma.part.update({
        where: { id: item.partId },
        data: {
          stockQuantity: {
            increment: item.quantity,
          },
          unitPrice: item.unitPrice, // Update unit price
        },
      });

      results.push({
        partId: item.partId,
        partNo: part.partNo,
        partName: part.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        stockMovement,
        updatedStock: updatedPart.stockQuantity,
      });
    }

    return {
      receiptNo,
      supplierName: dto.supplierName,
      supplierInvoiceNo: dto.supplierInvoiceNo,
      receiptDate,
      items: results,
      notes: dto.notes,
    };
  }

  async getReceipts(filters?: {
    dateFrom?: string;
    dateTo?: string;
    supplier?: string;
  }) {
    const where: any = {
      movementType: StockMovementType.IN,
    };

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

    if (filters?.supplier) {
      where.notes = {
        contains: filters.supplier,
        mode: 'insensitive' as any,
      };
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        part: {
          select: {
            id: true,
            partNo: true,
            name: true,
          },
        },
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

    // Group by reference (receiptNo)
    const grouped = movements.reduce((acc, movement) => {
      const receiptNo = movement.reference || 'UNKNOWN';
      if (!acc[receiptNo]) {
        acc[receiptNo] = {
          receiptNo,
          receiptDate: movement.createdAt,
          items: [],
          totalValue: 0,
          createdBy: movement.createdBy,
        };
      }

      const itemValue = Number(movement.unitPrice || 0) * movement.quantity;
      acc[receiptNo].items.push({
        partId: movement.part.id,
        partNo: movement.part.partNo,
        partName: movement.part.name,
        quantity: movement.quantity,
        unitPrice: movement.unitPrice,
        totalPrice: itemValue,
        notes: movement.notes,
      });
      acc[receiptNo].totalValue += itemValue;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }
}
