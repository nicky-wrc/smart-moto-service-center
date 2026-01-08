import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
