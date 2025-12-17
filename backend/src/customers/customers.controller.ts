import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Customer ใหม่' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'ดูรายชื่อ Customers ทั้งหมด' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'ดูรายละเอียด Customer' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดต Customer' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบ Customer' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id);
  }
}
