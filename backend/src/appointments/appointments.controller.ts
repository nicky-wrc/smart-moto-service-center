import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentConvertToJobDto } from './dto/convert-to-job.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { UserPayload } from '../common/decorators/user.decorator';

@ApiTags('Appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Appointment ใหม่' })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentUser() user: UserPayload) {
    return this.appointmentsService.create(createAppointmentDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการ Appointments' })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('motorcycle/:motorcycleId')
  @ApiOperation({ summary: 'ดู Appointments ของ Motorcycle' })
  findByMotorcycle(@Param('motorcycleId') motorcycleId: string) {
    return this.appointmentsService.findAppointmentsByMotorcycle(+motorcycleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียด Appointment' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดต Appointment' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  @Delete(':id')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบ Appointment' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }

  @Post(':id/convert-to-job')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'แปลง Appointment เป็น Job Order' })
  convertToJob(
    @Param('id') id: string,
    @Body() convertDto: AppointmentConvertToJobDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.appointmentsService.convertToJob(+id, convertDto, user.userId);
  }
}

