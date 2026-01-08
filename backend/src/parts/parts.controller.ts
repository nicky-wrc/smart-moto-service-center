import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PartsService } from './parts.service';
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
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@ApiTags('Parts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Part ใหม่' })
  create(@Body() data: CreatePartDto) {
    return this.partsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการ Parts (รองรับ filters)' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('isActive') isActive?: string,
    @Query('lowStock') lowStock?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (lowStock === 'true') filters.lowStock = true;
    if (search) filters.search = search;

    return this.partsService.findAll(filters);
  }

  @Get('low-stock')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ดู Parts ที่สต็อกต่ำ (ต่ำกว่า Reorder Point)' })
  getLowStock() {
    return this.partsService.getLowStock();
  }

  @Get('part-no/:partNo')
  @ApiOperation({ summary: 'ค้นหา Part ด้วย partNo' })
  findByPartNo(@Param('partNo') partNo: string) {
    return this.partsService.findByPartNo(partNo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียด Part' })
  findOne(@Param('id') id: string) {
    return this.partsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดต Part' })
  update(@Param('id') id: string, @Body() data: UpdatePartDto) {
    return this.partsService.update(+id, data);
  }

  @Patch(':id/adjust-stock')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ปรับสต็อก (เพิ่ม/ลดจำนวน)' })
  adjustStock(
    @Param('id') id: string,
    @Body() body: AdjustStockDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.partsService.adjustStock(
      +id,
      body.quantity,
      body.notes,
      user.userId,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบ Part (Soft delete - set isActive = false)' })
  remove(@Param('id') id: string) {
    return this.partsService.remove(+id);
  }
}
