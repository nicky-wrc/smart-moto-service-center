import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // สร้าง User (ยังเปิด Public ไว้ เพื่อให้สมัคร Admin คนแรกได้สะดวก)
  @Post()
  @ApiOperation({
    summary: 'สร้าง User ใหม่ (Public - สำหรับสร้าง admin คนแรก)',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ดูรายชื่อทั้งหมด (ต้อง Login + ADMIN/MANAGER)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ดูรายชื่อ Users ทั้งหมด' })
  findAll() {
    return this.usersService.findAll();
  }

  // ดูรายคน (ต้อง Login)
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ดูรายละเอียด User' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // แก้ไข (ต้อง Login + ADMIN/MANAGER)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดต User' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // ลบ (ต้อง Login + ADMIN)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'ลบ User' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
