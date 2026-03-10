import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceReminderDto } from './dto/create-service-reminder.dto';

@Injectable()
export class ServiceRemindersService {
  constructor(private prisma: PrismaService) {}

  async create(
    customerId: number,
    motorcycleId: number,
    dto: CreateServiceReminderDto,
  ) {
    // Verify customer and motorcycle exist
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const motorcycle = await this.prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
    });

    if (!motorcycle) {
      throw new NotFoundException(
        `Motorcycle with ID ${motorcycleId} not found`,
      );
    }

    if (motorcycle.ownerId !== customerId) {
      throw new BadRequestException(
        'Motorcycle does not belong to this customer',
      );
    }

    return this.prisma.serviceReminder.create({
      data: {
        customerId,
        motorcycleId,
        reminderType: dto.reminderType,
        dueMileage: dto.dueMileage,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        intervalMiles: dto.intervalMiles,
        intervalDays: dto.intervalDays,
        lastServiceMileage: dto.lastServiceMileage,
        lastServiceDate: dto.lastServiceDate
          ? new Date(dto.lastServiceDate)
          : undefined,
        isActive: true,
        notified: false,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        motorcycle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true,
            mileage: true,
          },
        },
      },
    });
  }

  async findByMotorcycle(motorcycleId: number) {
    return this.prisma.serviceReminder.findMany({
      where: { motorcycleId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        motorcycle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true,
            mileage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findDue() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return this.prisma.serviceReminder.findMany({
      where: {
        isActive: true,
        notified: false,
        OR: [
          {
            dueDate: {
              lte: today,
            },
          },
          {
            dueMileage: {
              not: null,
            },
          },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        motorcycle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true,
            mileage: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async markAsNotified(id: number) {
    const reminder = await this.prisma.serviceReminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      throw new NotFoundException(`Service Reminder with ID ${id} not found`);
    }

    return this.prisma.serviceReminder.update({
      where: { id },
      data: {
        notified: true,
        notifiedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        motorcycle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true,
          },
        },
      },
    });
  }
}
