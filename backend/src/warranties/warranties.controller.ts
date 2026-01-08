import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WarrantiesService } from './warranties.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { WarrantyStatus } from '@prisma/client';

@ApiTags('Warranties')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('warranties')
export class WarrantiesController {
  constructor(private readonly warrantiesService: WarrantiesService) {}

  @Get('check/motorcycle/:motorcycleId')
  @ApiOperation({ summary: 'ตรวจสอบสถานะการรับประกันของรถ' })
  @ApiQuery({ name: 'currentMileage', required: false, type: Number })
  checkWarranty(
    @Param('motorcycleId') motorcycleId: string,
    @Query('currentMileage') currentMileage?: string,
  ) {
    return this.warrantiesService.checkWarranty(
      +motorcycleId,
      currentMileage ? +currentMileage : undefined,
    );
  }

  @Get('motorcycle/:motorcycleId')
  @ApiOperation({ summary: 'ดูประวัติการรับประกันของรถ' })
  findByMotorcycle(@Param('motorcycleId') motorcycleId: string) {
    return this.warrantiesService.findByMotorcycle(+motorcycleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียด Warranty' })
  findOne(@Param('id') id: string) {
    return this.warrantiesService.findOne(+id);
  }

  @Post()
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Warranty ใหม่' })
  create(
    @Body()
    data: {
      warrantyNo: string;
      motorcycleId: number;
      startDate: string;
      endDate: string;
      mileageLimit?: number;
      description?: string;
    },
  ) {
    return this.warrantiesService.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดตสถานะ Warranty' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: WarrantyStatus },
  ) {
    return this.warrantiesService.updateStatus(+id, body.status);
  }
}
