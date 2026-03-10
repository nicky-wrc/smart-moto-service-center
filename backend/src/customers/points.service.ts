import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EarnPointsDto } from './dto/earn-points.dto';
import { UsePointsDto } from './dto/use-points.dto';
import { PointTransactionType } from '@prisma/client';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async getCustomerPoints(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    return {
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      points: customer.points,
    };
  }

  async getTransactions(
    customerId: number,
    filters?: { dateFrom?: string; dateTo?: string },
  ) {
    const where: any = { customerId };

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

    return this.prisma.pointTransaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async earn(dto: EarnPointsDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found`,
      );
    }

    // Calculate points from amount if provided
    let points = dto.points;
    if (dto.amount && !dto.points) {
      points = Math.floor(dto.amount / 100); // 1 point per 100 baht
    }

    // Create transaction
    await this.prisma.pointTransaction.create({
      data: {
        customerId: dto.customerId,
        type: PointTransactionType.EARN,
        points,
        amount: dto.amount,
        description:
          dto.description || `Earned ${points} points from ${dto.reference}`,
        reference: dto.reference,
      },
    });

    // Update customer points
    const updatedCustomer = await this.prisma.customer.update({
      where: { id: dto.customerId },
      data: {
        points: {
          increment: points,
        },
      },
    });

    return {
      customerId: updatedCustomer.id,
      pointsEarned: points,
      totalPoints: updatedCustomer.points,
    };
  }

  async use(dto: UsePointsDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found`,
      );
    }

    if (customer.points < dto.points) {
      throw new BadRequestException(
        `Insufficient points. Available: ${customer.points}, Required: ${dto.points}`,
      );
    }

    // Create transaction
    await this.prisma.pointTransaction.create({
      data: {
        customerId: dto.customerId,
        type: PointTransactionType.USE,
        points: -dto.points, // Negative for usage
        amount: dto.amount,
        description:
          dto.description ||
          `Used ${dto.points} points for ${dto.reference}${dto.amount ? ` (Discount: ${dto.amount} baht)` : ''}`,
        reference: dto.reference,
      },
    });

    // Update customer points
    const updatedCustomer = await this.prisma.customer.update({
      where: { id: dto.customerId },
      data: {
        points: {
          decrement: dto.points,
        },
      },
    });

    return {
      customerId: updatedCustomer.id,
      pointsUsed: dto.points,
      remainingPoints: updatedCustomer.points,
      discountAmount: dto.amount,
    };
  }
}
