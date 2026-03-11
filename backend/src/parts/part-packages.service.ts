import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { AddPackageItemDto } from './dto/add-package-item.dto';

@Injectable()
export class PartPackagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePackageDto) {
    // Generate package number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.partPackage.count({
      where: {
        packageNo: { startsWith: `PKG-${dateStr}` },
      },
    });
    const runNo = (count + 1).toString().padStart(4, '0');
    const packageNo = `PKG-${dateStr}-${runNo}`;

    // Validate parts exist
    for (const item of dto.items) {
      const part = await this.prisma.part.findUnique({
        where: { id: item.partId },
      });
      if (!part) {
        throw new NotFoundException(`Part with ID ${item.partId} not found`);
      }
    }

    // Create package with items
    return this.prisma.partPackage.create({
      data: {
        packageNo,
        name: dto.name,
        description: dto.description,
        sellingPrice: dto.sellingPrice,
        isActive: true,
        items: {
          create: dto.items.map((item) => ({
            partId: item.partId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            part: {
              select: {
                id: true,
                partNo: true,
                name: true,
                unit: true,
                unitPrice: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(filters?: { isActive?: boolean; search?: string }) {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { packageNo: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.partPackage.findMany({
      where,
      include: {
        items: {
          include: {
            part: {
              select: {
                id: true,
                partNo: true,
                name: true,
                unit: true,
                unitPrice: true,
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
    const package_ = await this.prisma.partPackage.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            part: {
              select: {
                id: true,
                partNo: true,
                name: true,
                unit: true,
                unitPrice: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
    });

    if (!package_) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return package_;
  }

  async update(id: number, dto: UpdatePackageDto) {
    const package_ = await this.prisma.partPackage.findUnique({
      where: { id },
    });

    if (!package_) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return this.prisma.partPackage.update({
      where: { id },
      data: dto,
      include: {
        items: {
          include: {
            part: {
              select: {
                id: true,
                partNo: true,
                name: true,
                unit: true,
                unitPrice: true,
              },
            },
          },
        },
      },
    });
  }

  async addItem(packageId: number, dto: AddPackageItemDto) {
    const package_ = await this.prisma.partPackage.findUnique({
      where: { id: packageId },
    });

    if (!package_) {
      throw new NotFoundException(`Package with ID ${packageId} not found`);
    }

    const part = await this.prisma.part.findUnique({
      where: { id: dto.partId },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${dto.partId} not found`);
    }

    // Check if item already exists
    const existing = await this.prisma.partPackageItem.findFirst({
      where: {
        packageId,
        partId: dto.partId,
      },
    });

    if (existing) {
      // Update quantity
      return this.prisma.partPackageItem.update({
        where: { id: existing.id },
        data: { quantity: dto.quantity },
      });
    }

    // Create new item
    return this.prisma.partPackageItem.create({
      data: {
        packageId,
        partId: dto.partId,
        quantity: dto.quantity,
      },
      include: {
        part: {
          select: {
            id: true,
            partNo: true,
            name: true,
            unit: true,
            unitPrice: true,
          },
        },
      },
    });
  }

  async removeItem(packageId: number, itemId: number) {
    const item = await this.prisma.partPackageItem.findFirst({
      where: {
        id: itemId,
        packageId,
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Package item with ID ${itemId} not found in package ${packageId}`,
      );
    }

    await this.prisma.partPackageItem.delete({
      where: { id: itemId },
    });

    return { message: 'Package item removed successfully' };
  }

  async delete(id: number) {
    const package_ = await this.prisma.partPackage.findUnique({
      where: { id },
    });

    if (!package_) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return this.prisma.partPackage.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
