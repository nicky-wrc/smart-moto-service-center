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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { QcJobDto } from './dto/qc-job.dto';
import { ReadyDeliveryJobDto } from './dto/ready-delivery-job.dto';
import { RequestInspectionDto } from './dto/request-inspection.dto';
import { CreateOldPartDto } from './dto/create-old-part.dto';
import { ReturnPartsDto } from './dto/return-parts.dto';
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
import { JobStatus, JobType } from '@prisma/client';

@ApiTags('Jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  @Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Job Order ใหม่' })
  create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: UserPayload) {
    return this.jobsService.create(createJobDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการ Jobs (รองรับ filters)' })
  @ApiQuery({ name: 'status', required: false, enum: JobStatus })
  @ApiQuery({ name: 'jobType', required: false, enum: JobType })
  @ApiQuery({ name: 'technicianId', required: false, type: Number })
  @ApiQuery({ name: 'motorcycleId', required: false, type: Number })
  findAll(
    @Query('status') status?: JobStatus,
    @Query('jobType') jobType?: JobType,
    @Query('technicianId') technicianId?: string,
    @Query('motorcycleId') motorcycleId?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (jobType) filters.jobType = jobType;
    if (technicianId) filters.technicianId = +technicianId;
    if (motorcycleId) filters.motorcycleId = +motorcycleId;

    return this.jobsService.findAll(filters);
  }

  @Get('queue')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ดู Job Queue สำหรับช่าง (เรียงตาม Fast Track)' })
  @ApiQuery({ name: 'technicianId', required: false, type: Number })
  getQueue(@Query('technicianId') technicianId?: string) {
    return this.jobsService.getJobQueue(
      technicianId ? +technicianId : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียด Job' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SERVICE_ADVISOR', 'TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดต Job' })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(+id, updateJobDto);
  }

  @Patch(':id/assign')
  @Roles('FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'มอบหมายงานให้ช่าง' })
  assignTechnician(
    @Param('id') id: string,
    @Body() assignDto: AssignTechnicianDto,
    @CurrentUser() _user: UserPayload,
  ) {
    return this.jobsService.assignTechnician(+id, assignDto.technicianId);
  }

  @Patch(':id/start')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เริ่มงาน (เปลี่ยน status เป็น IN_PROGRESS)' })
  startJob(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.jobsService.startJob(+id, user.userId);
  }

  @Patch(':id/complete')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ซ่อมเสร็จสิ้น (เปลี่ยน status เป็น QC_PENDING รอตรวจ)' })
  completeJob(
    @Param('id') id: string,
    @Body() body?: { diagnosisNotes?: string; mechanicNotes?: string },
  ) {
    return this.jobsService.completeJob(+id, body?.diagnosisNotes, body?.mechanicNotes);
  }

  @Patch(':id/cancel')
  @Roles('SERVICE_ADVISOR', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ยกเลิกงาน' })
  cancelJob(@Param('id') id: string, @Body() body?: { reason?: string }) {
    return this.jobsService.cancelJob(+id, body?.reason);
  }

  @Patch(':id/qc')
  @Roles('FOREMAN', 'MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'หัวหน้าช่างตรวจ QC งานซ่อม' })
  qcCheck(
    @Param('id') id: string,
    @Body() dto: QcJobDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.jobsService.qcCheck(+id, dto, user.userId);
  }

  @Patch(':id/ready-delivery')
  @Roles('SERVICE_ADVISOR', 'MANAGER', 'ADMIN', 'FOREMAN')
  @ApiOperation({ summary: 'เตรียมรถพร้อมส่งมอบ (ล้างรถเสร็จ)' })
  readyForDelivery(
    @Param('id') id: string,
    @Body() dto: ReadyDeliveryJobDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.jobsService.readyForDelivery(+id, dto, user.userId);
  }

  @Patch(':id/return-parts')
  @Roles('TECHNICIAN', 'FOREMAN', 'MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'คืนอะไหล่ส่วนที่ไม่ได้ใช้กลับเข้าคลัง' })
  returnParts(
    @Param('id') id: string,
    @Body() dto: ReturnPartsDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.jobsService.returnParts(+id, dto, user.userId);
  }

  @Patch(':id/request-inspection')
  @Roles('FOREMAN', 'MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'ระบุว่าต้องตรวจสอบเชิงลึก (ผ่าเครื่อง) + ประเมินค่าตรวจ' })
  requestInspection(
    @Param('id') id: string,
    @Body() dto: RequestInspectionDto,
  ) {
    return this.jobsService.requestInspection(+id, dto);
  }

  @Post(':id/old-parts')
  @Roles('TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'บันทึกอะไหล่เก่าที่ถอดออกจากรถลูกค้า' })
  createOldPart(
    @Param('id') id: string,
    @Body() dto: CreateOldPartDto,
  ) {
    return this.jobsService.createOldPart(+id, dto);
  }

  @Get(':id/old-parts')
  @ApiOperation({ summary: 'ดูรายการอะไหล่เก่าที่ถอดออกจากงานนี้' })
  getOldParts(@Param('id') id: string) {
    return this.jobsService.getOldParts(+id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบ Job' })
  remove(@Param('id') id: string) {
    return this.jobsService.remove(+id);
  }
}

