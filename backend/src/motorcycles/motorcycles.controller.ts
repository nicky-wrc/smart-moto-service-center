import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MotorcyclesService } from './motorcycles.service';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Motorcycles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('motorcycles')
export class MotorcyclesController {
  constructor(private readonly motorcyclesService: MotorcyclesService) {}

  @Post()
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Motorcycle ใหม่' })
  create(@Body() createMotorcycleDto: CreateMotorcycleDto) {
    return this.motorcyclesService.create(createMotorcycleDto);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการ Motorcycles' })
  findAll() {
    return this.motorcyclesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียด Motorcycle' })
  findOne(@Param('id') id: string) {
    return this.motorcyclesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดต Motorcycle' })
  update(
    @Param('id') id: string,
    @Body() updateMotorcycleDto: UpdateMotorcycleDto,
  ) {
    return this.motorcyclesService.update(+id, updateMotorcycleDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบ Motorcycle' })
  remove(@Param('id') id: string) {
    return this.motorcyclesService.remove(+id);
  }
}
