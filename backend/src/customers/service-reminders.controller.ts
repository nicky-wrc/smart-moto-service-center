import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ServiceRemindersService } from './service-reminders.service';
import { CreateServiceReminderDto } from './dto/create-service-reminder.dto';

@ApiTags('Service Reminders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class ServiceRemindersController {
  constructor(
    private readonly serviceRemindersService: ServiceRemindersService,
  ) {}

  @Post(':customerId/motorcycles/:motorcycleId/reminders')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ตั้งการแจ้งเตือนเช็คระยะ' })
  createReminder(
    @Param('customerId') customerId: string,
    @Param('motorcycleId') motorcycleId: string,
    @Body() dto: CreateServiceReminderDto,
  ) {
    return this.serviceRemindersService.create(+customerId, +motorcycleId, dto);
  }

  @Get(':customerId/motorcycles/:motorcycleId/reminders')
  @ApiOperation({ summary: 'ดูการแจ้งเตือนของรถ' })
  getReminders(
    @Param('customerId') customerId: string,
    @Param('motorcycleId') motorcycleId: string,
  ) {
    return this.serviceRemindersService.findByMotorcycle(+motorcycleId);
  }

  @Get('reminders/due')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ดูการแจ้งเตือนที่ถึงกำหนด' })
  getDueReminders() {
    return this.serviceRemindersService.findDue();
  }

  @Patch('reminders/:id/notify')
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'บันทึกว่าแจ้งเตือนแล้ว' })
  markAsNotified(@Param('id') id: string) {
    return this.serviceRemindersService.markAsNotified(+id);
  }
}
