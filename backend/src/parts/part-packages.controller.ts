import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PartPackagesService } from './part-packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { AddPackageItemDto } from './dto/add-package-item.dto';

@ApiTags('Part Packages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('part-packages')
export class PartPackagesController {
  constructor(private readonly partPackagesService: PartPackagesService) {}

  @Post()
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้างชุดอะไหล่ (Package)' })
  create(@Body() dto: CreatePackageDto) {
    return this.partPackagesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการชุดอะไหล่' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.partPackagesService.findAll({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดชุดอะไหล่' })
  findOne(@Param('id') id: string) {
    return this.partPackagesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดตชุดอะไหล่' })
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.partPackagesService.update(+id, dto);
  }

  @Post(':id/items')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เพิ่มอะไหล่เข้าไปในชุด' })
  addItem(@Param('id') id: string, @Body() dto: AddPackageItemDto) {
    return this.partPackagesService.addItem(+id, dto);
  }

  @Delete(':id/items/:itemId')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบอะไหล่ออกจากชุด' })
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.partPackagesService.removeItem(+id, +itemId);
  }

  @Delete(':id')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบชุดอะไหล่ (Soft delete)' })
  delete(@Param('id') id: string) {
    return this.partPackagesService.delete(+id);
  }
}
