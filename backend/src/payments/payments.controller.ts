import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('job/:jobId/calculate')
  @Roles('CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'คำนวณค่าใช้จ่ายของ Job' })
  calculateBilling(@Param('jobId') jobId: string) {
    return this.paymentsService.calculateBilling(+jobId);
  }

  @Post()
  @Roles('CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Payment ใหม่' })
  create(@Body() data: CreatePaymentDto) {
    return this.paymentsService.create(data);
  }

  @Patch(':id/process')
  @Roles('CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ยืนยันการชำระเงิน (mark as paid)' })
  processPayment(@Param('id') id: string) {
    return this.paymentsService.processPayment(+id);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการ Payments (รองรับ filters)' })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'paymentMethod', required: false, enum: PaymentMethod })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  findAll(
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('paymentMethod') paymentMethod?: PaymentMethod,
    @Query('customerId') customerId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (customerId) filters.customerId = +customerId;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.paymentsService.findAll(filters);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'ดู Payment ของ Job' })
  findByJob(@Param('jobId') jobId: string) {
    return this.paymentsService.findByJob(+jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียด Payment' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }
}


