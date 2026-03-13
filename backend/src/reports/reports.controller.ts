import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reports (รายงาน / Owner Dashboard)')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'รายงานรายวัน (รายได้, จำนวนงาน)' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'YYYY-MM-DD (default: today)',
  })
  getDailyReport(@Query('date') date?: string) {
    return this.reportsService.getDailyReport(
      date ? new Date(date) : new Date(),
    );
  }

  @Get('monthly')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'รายงานรายเดือน' })
  @ApiQuery({ name: 'month', required: true, example: 3 })
  @ApiQuery({ name: 'year', required: true, example: 2026 })
  getMonthlyReport(@Query('month') month: string, @Query('year') year: string) {
    return this.reportsService.getMonthlyReport(+month, +year);
  }

  @Get('profit')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'รายงานกำไร (รายได้ - ต้นทุนอะไหล่)' })
  @ApiQuery({ name: 'dateFrom', required: true })
  @ApiQuery({ name: 'dateTo', required: true })
  getProfitReport(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportsService.getProfitReport(
      new Date(dateFrom),
      new Date(dateTo),
    );
  }

  @Get('pending-jobs')
  @Roles('MANAGER', 'ADMIN', 'FOREMAN')
  @ApiOperation({ summary: 'สรุปงานค้าง (แยกตามสถานะ)' })
  getPendingJobs() {
    return this.reportsService.getPendingJobs();
  }

  @Get('employee-salary')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'รายงานเงินเดือน + ค่าคอมพนักงาน' })
  @ApiQuery({ name: 'month', required: true, example: 3 })
  @ApiQuery({ name: 'year', required: true, example: 2026 })
  getEmployeeSalaryReport(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.reportsService.getEmployeeSalaryReport(+month, +year);
  }

  @Get('stock-summary')
  @Roles('MANAGER', 'ADMIN', 'STOCK_KEEPER')
  @ApiOperation({ summary: 'รายงานสต๊อกคงเหลือ' })
  getStockSummary() {
    return this.reportsService.getStockSummary();
  }

  @Get('stock-low')
  @Roles('MANAGER', 'ADMIN', 'STOCK_KEEPER')
  @ApiOperation({ summary: 'อะไหล่ใกล้หมด (ต่ำกว่า reorder point)' })
  getLowStockReport() {
    return this.reportsService.getLowStockReport();
  }

  @Get('stock-best-sellers')
  @Roles('MANAGER', 'ADMIN', 'STOCK_KEEPER')
  @ApiOperation({ summary: 'อะไหล่ขายดี (เบิกออกมากที่สุด)' })
  @ApiQuery({ name: 'dateFrom', required: true })
  @ApiQuery({ name: 'dateTo', required: true })
  getBestSellersReport(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportsService.getBestSellersReport(
      new Date(dateFrom),
      new Date(dateTo),
    );
  }

  @Get('stock-non-moving')
  @Roles('MANAGER', 'ADMIN', 'STOCK_KEEPER')
  @ApiOperation({
    summary: 'อะไหล่ไม่เคลื่อนไหว (ไม่มี movement ในช่วงเวลาที่กำหนด)',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'จำนวนวันย้อนหลัง (default: 90)',
    example: 90,
  })
  getNonMovingReport(@Query('days') days?: string) {
    return this.reportsService.getNonMovingReport(days ? +days : 90);
  }
}
