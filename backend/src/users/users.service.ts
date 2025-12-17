// backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service'; // Import ให้ถูก path
import * as bcrypt from 'bcrypt'; // เดี๋ยวเราต้องลงตัวนี้เพิ่ม

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Hash Password เพื่อความปลอดภัย (ไม่เก็บรหัสตรงๆ)
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 2. บันทึกลง Database
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword, // ใช้รหัสที่ Hash แล้ว
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  
  // (Method อื่นๆ ปล่อยไว้ก่อนได้ครับ)
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}