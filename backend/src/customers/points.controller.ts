import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PointsService } from './points.service';
import { EarnPointsDto } from './dto/earn-points.dto';
import { UsePointsDto } from './dto/use-points.dto';

@ApiTags('Points')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get(':id/points')
  @ApiOperation({ summary: 'ดูแต้มสะสมของลูกค้า' })
  getCustomerPoints(@Param('id') id: string) {
    return this.pointsService.getCustomerPoints(+id);
  }

  @Get(':id/points/transactions')
  @ApiOperation({ summary: 'ดูประวัติการสะสม/ใช้แต้ม' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  getPointTransactions(
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.pointsService.getTransactions(+id, { dateFrom, dateTo });
  }

  @Post('points/earn')
  @Roles('CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สะสมแต้มให้ลูกค้า' })
  earnPoints(@Body() dto: EarnPointsDto) {
    return this.pointsService.earn(dto);
  }

  @Post('points/use')
  @Roles('CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ใช้แต้มลดราคา' })
  usePoints(@Body() dto: UsePointsDto) {
    return this.pointsService.use(dto);
  }
}
