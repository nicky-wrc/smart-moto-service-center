import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard & Reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard/sales-summary')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สรุปยอดขาย' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  getSalesSummary(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.dashboardService.getSalesSummary({ dateFrom, dateTo });
  }

  @Get('dashboard/top-parts')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อะไหล่ขายดี' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopParts(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getTopParts({
      dateFrom,
      dateTo,
      limit: limit ? +limit : 10,
    });
  }

  @Get('dashboard/technician-performance')
  @Roles('ADMIN', 'MANAGER', 'FOREMAN', 'TECHNICIAN')
  @ApiOperation({ summary: 'ประสิทธิภาพช่าง' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'technicianId', required: false, type: Number })
  getTechnicianPerformance(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('technicianId') technicianId?: string,
  ) {
    return this.dashboardService.getTechnicianPerformance({
      dateFrom,
      dateTo,
      technicianId: technicianId ? +technicianId : undefined,
    });
  }

  @Get('dashboard/technician-idle-time')
  @Roles('ADMIN', 'MANAGER', 'FOREMAN')
  @ApiOperation({ summary: 'เวลาว่างของช่าง' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  getTechnicianIdleTime(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.dashboardService.getTechnicianIdleTime({ dateFrom, dateTo });
  }
}
