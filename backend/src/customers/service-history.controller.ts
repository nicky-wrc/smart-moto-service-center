import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ServiceHistoryService } from './service-history.service';

@ApiTags('Service History')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class ServiceHistoryController {
  constructor(private readonly serviceHistoryService: ServiceHistoryService) {}

  @Get(':customerId/motorcycles/:motorcycleId/history')
  @ApiOperation({ summary: 'ดูประวัติการซ่อม' })
  getServiceHistory(
    @Param('customerId') customerId: string,
    @Param('motorcycleId') motorcycleId: string,
  ) {
    return this.serviceHistoryService.getHistory(+customerId, +motorcycleId);
  }
}
