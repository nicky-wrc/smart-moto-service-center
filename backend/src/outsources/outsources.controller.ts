import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { OutsourcesService } from './outsources.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateOutsourceDto } from './dto/create-outsource.dto';
import { UpdateOutsourceDto } from './dto/update-outsource.dto';

@ApiTags('Outsources')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('outsources')
export class OutsourcesController {
  constructor(private readonly outsourcesService: OutsourcesService) {}

  @Post()
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Outsource record' })
  create(@Body() data: CreateOutsourceDto) {
    return this.outsourcesService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการ Outsources' })
  @ApiQuery({ name: 'jobId', required: false, type: Number })
  findAll(@Query('jobId') jobId?: string) {
    return this.outsourcesService.findAll(jobId ? +jobId : undefined);
  }

  @Get('job/:jobId/total')
  @ApiOperation({ summary: 'ดูค่า Outsource รวมของ Job' })
  getTotalCost(@Param('jobId') jobId: string) {
    return this.outsourcesService.getTotalOutsourceCost(+jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียด Outsource' })
  findOne(@Param('id') id: string) {
    return this.outsourcesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดต Outsource' })
  update(@Param('id') id: string, @Body() data: UpdateOutsourceDto) {
    return this.outsourcesService.update(+id, {
      ...data,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    });
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบ Outsource' })
  remove(@Param('id') id: string) {
    return this.outsourcesService.remove(+id);
  }
}


