import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service'; // Import Prisma

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  findAll() {
    return this.prisma.customer.findMany({
      include: { motorcycles: true }, // ดึงข้อมูลรถมาแสดงด้วยเลย
    });
  }

  findOne(id: number) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: { motorcycles: true },
    });
  }

  // ... (Update/Remove เขียนคล้ายๆ เดิม หรือปล่อยไว้ก่อนได้ครับ)
  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
