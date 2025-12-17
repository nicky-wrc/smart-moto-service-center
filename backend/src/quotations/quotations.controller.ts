import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { UserPayload } from '../common/decorators/user.decorator';
import { QuotationStatus } from '@prisma/client';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationConvertToJobDto } from './dto/convert-to-job.dto';

@ApiTags('Quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @Roles('SERVICE_ADVISOR', 'CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Quotation ใหม่' })
  create(@Body() data: CreateQuotationDto, @CurrentUser() user: UserPayload) {
    return this.quotationsService.create({
      ...data,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      createdById: user.userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการ Quotations (รองรับ filters)' })
  @ApiQuery({ name: 'status', required: false, enum: QuotationStatus })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiQuery({ name: 'motorcycleId', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  findAll(
    @Query('status') status?: QuotationStatus,
    @Query('customerId') customerId?: string,
    @Query('motorcycleId') motorcycleId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (customerId) filters.customerId = +customerId;
    if (motorcycleId) filters.motorcycleId = +motorcycleId;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.quotationsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียด Quotation' })
  findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(+id);
  }

  @Patch(':id/send')
  @Roles('SERVICE_ADVISOR', 'CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ส่ง Quotation ให้ลูกค้า (เปลี่ยน status เป็น SENT)' })
  sendQuotation(@Param('id') id: string) {
    return this.quotationsService.sendQuotation(+id);
  }

  @Patch(':id/approve')
  @Roles('SERVICE_ADVISOR', 'CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อนุมัติ Quotation (เปลี่ยน status เป็น APPROVED)' })
  approveQuotation(@Param('id') id: string) {
    return this.quotationsService.approveQuotation(+id);
  }

  @Patch(':id/reject')
  @Roles('SERVICE_ADVISOR', 'CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ปฏิเสธ Quotation (เปลี่ยน status เป็น REJECTED)' })
  rejectQuotation(@Param('id') id: string) {
    return this.quotationsService.rejectQuotation(+id);
  }

  @Post(':id/convert-to-job')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'แปลง Quotation ที่ approve แล้วเป็น Job' })
  convertToJob(@Param('id') id: string, @Body() body: QuotationConvertToJobDto, @CurrentUser() user: UserPayload) {
    return this.quotationsService.convertToJob(+id, body.symptom, user.userId);
  }

  @Patch(':id')
  @Roles('SERVICE_ADVISOR', 'CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดต Quotation (ได้เฉพาะ DRAFT)' })
  update(@Param('id') id: string, @Body() data: UpdateQuotationDto) {
    return this.quotationsService.update(+id, {
      ...data,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    });
  }
}

