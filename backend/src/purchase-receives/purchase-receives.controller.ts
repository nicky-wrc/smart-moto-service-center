import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PurchaseReceivesService } from './purchase-receives.service';
import { CreatePurchaseReceiveDto } from './dto/create-purchase-receive.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { UserPayload } from '../common/decorators/user.decorator';

@ApiTags('Purchase Receives (รับสินค้าเข้า)')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('purchase-receives')
export class PurchaseReceivesController {
  constructor(private readonly service: PurchaseReceivesService) {}

  @Post()
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'รับสินค้าเข้าจาก PO (ตัดสต๊อก IN, อัปเดต PO status)',
  })
  create(
    @Body() dto: CreatePurchaseReceiveDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.service.create(user.userId, dto);
  }

  @Get()
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ดูรายการรับสินค้าทั้งหมด' })
  @ApiQuery({ name: 'purchaseOrderId', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  findAll(
    @Query('purchaseOrderId') purchaseOrderId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};
    if (purchaseOrderId) filters.purchaseOrderId = +purchaseOrderId;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    return this.service.findAll(filters);
  }

  @Get(':id')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ดูรายละเอียดการรับสินค้า' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }
}
