import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { LaborTimesService } from './labor-times.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { UserPayload } from '../common/decorators/user.decorator';
import { StartLaborTimeDto } from './dto/start-labor-time.dto';

@ApiTags('Labor Times')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('labor-times')
export class LaborTimesController {
  constructor(private readonly laborTimesService: LaborTimesService) {}

  @Post('start')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เริ่มจับเวลาแรงงาน' })
  startLaborTime(@Body() body: StartLaborTimeDto, @CurrentUser() user: UserPayload) {
    return this.laborTimesService.startLaborTime(
      body.jobId,
      user.userId,
      body.taskDescription,
      body.hourlyRate,
      body.standardMinutes,
    );
  }

  @Patch(':id/pause')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'หยุดจับเวลา (pause)' })
  pauseLaborTime(@Param('id') id: string) {
    return this.laborTimesService.pauseLaborTime(+id);
  }

  @Patch(':id/resume')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เริ่มจับเวลาต่อ (resume)' })
  resumeLaborTime(@Param('id') id: string) {
    return this.laborTimesService.resumeLaborTime(+id);
  }

  @Patch(':id/finish')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เสร็จสิ้นการจับเวลา' })
  finishLaborTime(@Param('id') id: string) {
    return this.laborTimesService.finishLaborTime(+id);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'ดู Labor Times ของ Job' })
  findByJob(@Param('jobId') jobId: string) {
    return this.laborTimesService.findByJob(+jobId);
  }

  @Get('job/:jobId/total')
  @ApiOperation({ summary: 'ดูค่าแรงรวมของ Job' })
  getTotalLaborCost(@Param('jobId') jobId: string) {
    return this.laborTimesService.getTotalLaborCost(+jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียด Labor Time' })
  findOne(@Param('id') id: string) {
    return this.laborTimesService.findOne(+id);
  }
}


