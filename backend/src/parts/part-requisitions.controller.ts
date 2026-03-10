import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { UserPayload } from '../common/decorators/user.decorator';
import { PartRequisitionsService } from './part-requisitions.service';
import { ApproveRequisitionDto } from './dto/approve-requisition.dto';
import { RejectRequisitionDto } from './dto/reject-requisition.dto';
import { IssueRequisitionDto } from './dto/issue-requisition.dto';
import { CreateRequisitionDto } from './dto/create-requisition.dto';
import { PartRequisitionStatus } from '@prisma/client';

@ApiTags('Part Requisitions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('part-requisitions')
export class PartRequisitionsController {
  constructor(
    private readonly partRequisitionsService: PartRequisitionsService,
  ) {}

  @Post()
  @Roles('TECHNICIAN', 'FOREMAN', 'STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้างคำขอเบิกอะไหล่' })
  create(
    @Body() dto: CreateRequisitionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.partRequisitionsService.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการคำขอเบิกอะไหล่' })
  @ApiQuery({ name: 'status', required: false, enum: PartRequisitionStatus })
  @ApiQuery({ name: 'jobId', required: false, type: Number })
  @ApiQuery({ name: 'technicianId', required: false, type: Number })
  findAll(
    @Query('status') status?: PartRequisitionStatus,
    @Query('jobId') jobId?: string,
    @Query('technicianId') technicianId?: string,
  ) {
    return this.partRequisitionsService.findAll({
      status,
      jobId: jobId ? +jobId : undefined,
      technicianId: technicianId ? +technicianId : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดคำขอเบิกอะไหล่' })
  findOne(@Param('id') id: string) {
    return this.partRequisitionsService.findOne(+id);
  }

  @Patch(':id/approve')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อนุมัติคำขอเบิกอะไหล่' })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveRequisitionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.partRequisitionsService.approve(+id, dto, user.userId);
  }

  @Patch(':id/reject')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ปฏิเสธคำขอเบิกอะไหล่' })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectRequisitionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.partRequisitionsService.reject(+id, dto.reason, user.userId);
  }

  @Patch(':id/issue')
  @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เบิกอะไหล่ (ตัดสต็อก)' })
  issue(
    @Param('id') id: string,
    @Body() dto: IssueRequisitionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.partRequisitionsService.issue(+id, dto, user.userId);
  }
}
