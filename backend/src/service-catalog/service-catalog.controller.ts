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
import { ServiceCatalogService } from './service-catalog.service';
import { CreateServiceCatalogDto } from './dto/create-service-catalog.dto';
import { UpdateServiceCatalogDto } from './dto/update-service-catalog.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Service Catalog (รายการค่าแรง)')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('service-catalog')
export class ServiceCatalogController {
  constructor(private readonly service: ServiceCatalogService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เพิ่มรายการค่าแรงใหม่' })
  create(@Body() dto: CreateServiceCatalogDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'ดูรายการค่าแรงทั้งหมด (search, filter by tag/category)',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAll({
      search,
      category,
      tag,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('tags')
  @ApiOperation({ summary: 'ดูรายการแท็กทั้งหมด' })
  getTags() {
    return this.service.getTags();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดค่าแรง' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'แก้ไขรายการค่าแรง' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceCatalogDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ปิดการใช้งานรายการค่าแรง' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
