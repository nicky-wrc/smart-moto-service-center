import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MotorcyclesService } from './motorcycles.service';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()

@Controller('motorcycles')
export class MotorcyclesController {
  constructor(private readonly motorcyclesService: MotorcyclesService) {}

  @Post()
  create(@Body() createMotorcycleDto: CreateMotorcycleDto) {
    return this.motorcyclesService.create(createMotorcycleDto);
  }

  @Get()
  findAll() {
    return this.motorcyclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.motorcyclesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMotorcycleDto: UpdateMotorcycleDto) {
    return this.motorcyclesService.update(+id, updateMotorcycleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.motorcyclesService.remove(+id);
  }
}
