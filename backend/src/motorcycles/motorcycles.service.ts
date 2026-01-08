import { Injectable } from '@nestjs/common';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotorcyclesService {
  constructor(private prisma: PrismaService) {}

  create(createMotorcycleDto: CreateMotorcycleDto) {
    return this.prisma.motorcycle.create({
      data: createMotorcycleDto,
    });
  }

  findAll() {
    return this.prisma.motorcycle.findMany({
      include: { owner: true }, // ดึงข้อมูลเจ้าของรถมาโชว์ด้วย
    });
  }

  findOne(id: number) {
    return this.prisma.motorcycle.findUnique({
      where: { id },
      include: { owner: true },
    });
  }

  update(id: number, updateMotorcycleDto: UpdateMotorcycleDto) {
    return this.prisma.motorcycle.update({
      where: { id },
      data: updateMotorcycleDto,
    });
  }

  remove(id: number) {
    return this.prisma.motorcycle.delete({ where: { id } });
  }
}
