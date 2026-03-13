import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateCustomerWithMotorcycleDto } from './dto/create-customer-motorcycle.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({
        data: createCustomerDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('เบอร์โทรศัพท์นี้มีอยู่แล้วในระบบ');
        }
      }
      throw error;
    }
  }

  async createWithMotorcycle(dto: CreateCustomerWithMotorcycleDto) {
    try {
      // สร้างลูกค้าพร้อมพ่วงรถใน Transaction เดียว (Prisma Nested Writes)
      return await this.prisma.customer.create({
        data: {
          phoneNumber: dto.phoneNumber,
          title: dto.title,
          firstName: dto.firstName,
          lastName: dto.lastName,
          address: dto.address,
          taxId: dto.taxId,
          motorcycles: {
            create: {
              vin: dto.motorcycle.vin || `AUTO-VIN-${Date.now()}`, // Prisma require unique VIN ถ้าไม่ได้ใส่มา
              licensePlate: dto.motorcycle.licensePlate,
              brand: dto.motorcycle.brand,
              model: dto.motorcycle.model,
              color: dto.motorcycle.color,
              year: dto.motorcycle.year,
              engineNo: dto.motorcycle.engineNo,
              mileage: dto.motorcycle.mileage,
            },
          },
        },
        include: {
          motorcycles: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'เบอร์โทรศัพท์นี้หรือข้อมูลรถบางอย่างมีอยู่แล้วในระบบ',
          );
        }
      }
      throw error;
    }
  }

  async search(query: string) {
    if (!query) return [];

    // ค้นหาโดย ชื่อ, นามสกุล, เบอร์โทร, หรือ ป้ายทะเบียนรถ
    return this.prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } },
          {
            motorcycles: {
              some: {
                licensePlate: { contains: query, mode: 'insensitive' },
              },
            },
          },
        ],
      },
      include: {
        motorcycles: true,
      },
      take: 20, // Limit results
    });
  }

  async findAll() {
    return this.prisma.customer.findMany({
      include: { motorcycles: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { motorcycles: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    try {
      return await this.prisma.customer.update({
        where: { id },
        data: updateCustomerDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('เบอร์โทรศัพท์นี้มีอยู่แล้วในระบบ');
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
