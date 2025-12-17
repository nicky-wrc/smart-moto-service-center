import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WarrantyStatus } from '@prisma/client';

@Injectable()
export class WarrantiesService {
  constructor(private prisma: PrismaService) {}

  async checkWarranty(motorcycleId: number, currentMileage?: number) {
    const warranties = await this.prisma.warranty.findMany({
      where: {
        motorcycleId,
        status: {
          not: WarrantyStatus.VOID,
        },
      },
      orderBy: {
        endDate: 'desc',
      },
    });

    if (warranties.length === 0) {
      return {
        hasWarranty: false,
        message: 'ไม่พบการรับประกัน',
        warranties: [],
      };
    }

    const now = new Date();
    const validWarranties = warranties.filter((w) => {
      const isDateValid = new Date(w.endDate) >= now;
      const isMileageValid = currentMileage
        ? w.mileageLimit === null || currentMileage <= w.mileageLimit
        : true;
      return isDateValid && isMileageValid && w.status === WarrantyStatus.VALID;
    });

    if (validWarranties.length === 0) {
      await this.prisma.warranty.updateMany({
        where: {
          motorcycleId,
          OR: [
            { endDate: { lt: now } },
            ...(currentMileage ? [{ mileageLimit: { lt: currentMileage } }] : []),
          ],
          status: WarrantyStatus.VALID,
        },
        data: {
          status: WarrantyStatus.EXPIRED,
        },
      });

      return {
        hasWarranty: false,
        message: 'การรับประกันหมดอายุแล้ว',
        warranties: [],
      };
    }

    const latestWarranty = validWarranties[0];

    return {
      hasWarranty: true,
      message: `พบการรับประกัน ${validWarranties.length} รายการ`,
      warranties: validWarranties,
      validUntil: latestWarranty.endDate,
      mileageLimit: latestWarranty.mileageLimit,
    };
  }

  async findByMotorcycle(motorcycleId: number) {
    return this.prisma.warranty.findMany({
      where: { motorcycleId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const warranty = await this.prisma.warranty.findUnique({
      where: { id },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!warranty) {
      throw new NotFoundException(`Warranty with ID ${id} not found`);
    }

    return warranty;
  }

  async create(data: {
    warrantyNo: string;
    motorcycleId: number;
    startDate: Date;
    endDate: Date;
    mileageLimit?: number;
    description?: string;
  }) {
    return this.prisma.warranty.create({
      data: {
        ...data,
        status: WarrantyStatus.VALID,
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

  async updateStatus(id: number, status: WarrantyStatus) {
    const warranty = await this.prisma.warranty.findUnique({
      where: { id },
    });

    if (!warranty) {
      throw new NotFoundException(`Warranty with ID ${id} not found`);
    }

    return this.prisma.warranty.update({
      where: { id },
      data: { status },
      include: {
        motorcycle: {
          include: {
            owner: true,
          },
        },
      },
    });
  }
}


