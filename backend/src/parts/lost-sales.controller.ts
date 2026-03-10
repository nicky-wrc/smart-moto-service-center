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
import { LostSalesService } from './lost-sales.service';
import { CreateLostSaleDto } from './dto/create-lost-sale.dto';

@ApiTags('Lost Sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('lost-sales')
export class LostSalesController {
  constructor(private readonly lostSalesService: LostSalesService) {}

  @Post()
  @Roles('STOCK_KEEPER', 'CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'บันทึก Lost Sales (ของหมด)' })
  create(@Body() dto: CreateLostSaleDto) {
    return this.lostSalesService.create(dto);
  }

  @Get()
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ดูรายการ Lost Sales' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'partId', required: false, type: Number })
  findAll(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('partId') partId?: string,
  ) {
    return this.lostSalesService.findAll({
      dateFrom,
      dateTo,
      partId: partId ? +partId : undefined,
    });
  }

  @Get('summary')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สรุป Lost Sales (สำหรับ Dashboard)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  getSummary(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.lostSalesService.getSummary({ dateFrom, dateTo });
  }

  @Get(':id')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ดูรายละเอียด Lost Sale' })
  findOne(@Param('id') id: string) {
    return this.lostSalesService.findOne(+id);
  }
}
