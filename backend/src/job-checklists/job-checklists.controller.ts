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
import { JobChecklistsService } from './job-checklists.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Job Checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('job-checklists')
export class JobChecklistsController {
  constructor(private readonly jobChecklistsService: JobChecklistsService) {}

  @Post('job/:jobId')
  @Roles('TECHNICIAN', 'FOREMAN', 'SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เพิ่ม Checklist Items (หลายรายการ)' })
  createChecklistItems(
    @Param('jobId') jobId: string,
    @Body()
    items: Array<{ itemName: string; condition: string; notes?: string }>,
  ) {
    return this.jobChecklistsService.createChecklistItems(+jobId, items);
  }

  @Post('job/:jobId/item')
  @Roles('TECHNICIAN', 'FOREMAN', 'SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เพิ่ม Checklist Item (รายการเดียว)' })
  createChecklistItem(
    @Param('jobId') jobId: string,
    @Body() body: { itemName: string; condition: string; notes?: string },
  ) {
    return this.jobChecklistsService.createChecklistItem(
      +jobId,
      body.itemName,
      body.condition,
      body.notes,
    );
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'ดู Checklist Items ของ Job' })
  findByJob(@Param('jobId') jobId: string) {
    return this.jobChecklistsService.findByJob(+jobId);
  }

  @Patch(':id')
  @Roles('TECHNICIAN', 'FOREMAN', 'SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดต Checklist Item' })
  update(
    @Param('id') id: string,
    @Body() data: { itemName?: string; condition?: string; notes?: string },
  ) {
    return this.jobChecklistsService.update(+id, data);
  }

  @Delete(':id')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบ Checklist Item' })
  remove(@Param('id') id: string) {
    return this.jobChecklistsService.remove(+id);
  }

  @Delete('job/:jobId')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบ Checklist Items ทั้งหมดของ Job' })
  removeByJob(@Param('jobId') jobId: string) {
    return this.jobChecklistsService.removeByJob(+jobId);
  }
}
