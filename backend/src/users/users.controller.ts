import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'; // <--- 1. เพิ่ม UseGuards ตรงนี้
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // สร้าง User (ยังเปิด Public ไว้ เพื่อให้สมัคร Admin คนแรกได้สะดวก)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ดูรายชื่อทั้งหมด (ต้อง Login)
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  findAll() {
    return this.usersService.findAll();
  }

  // ดูรายคน (ต้อง Login)
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // แก้ไข (ต้อง Login)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // ลบ (ต้อง Login)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}