import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { PartRequisitionsService } from './part-requisitions.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { UserPayload } from '../common/decorators/user.decorator';
import { PartRequisitionStatus } from '@prisma/client';
import { IssuePartRequisitionDto } from './dto/issue-part-requisition.dto';
import { RequestPartsDto } from './dto/request-parts.dto';
import { ReturnPartsDto } from './dto/return-parts.dto';

@ApiTags('Part Requisitions (ใบเบิกอะไหล่)')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('part-requisitions')
export class PartRequisitionsController {
    constructor(private readonly requisitionsService: PartRequisitionsService) { }

    @Get()
    @Roles('SERVICE_ADVISOR', 'CASHIER', 'ADMIN', 'MANAGER', 'FOREMAN', 'STOCK_KEEPER')
    @ApiOperation({ summary: 'ดูรายการใบเบิกทั้งหมด' })
    @ApiQuery({ name: 'status', required: false, enum: PartRequisitionStatus })
    @ApiQuery({ name: 'jobId', required: false, type: Number })
    findAll(
        @Query('status') status?: PartRequisitionStatus,
        @Query('jobId') jobId?: string,
    ) {
        const filters: any = {};
        if (status) filters.status = status;
        if (jobId) filters.jobId = +jobId;

        return this.requisitionsService.findAll(filters);
    }

    @Get(':id')
    @Roles('SERVICE_ADVISOR', 'CASHIER', 'ADMIN', 'MANAGER', 'FOREMAN', 'STOCK_KEEPER')
    @ApiOperation({ summary: 'ดูรายละเอียดใบเบิก' })
    findOne(@Param('id') id: string) {
        return this.requisitionsService.findOne(+id);
    }

    @Patch(':id/issue')
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER', 'FOREMAN')
    @ApiOperation({ summary: 'คลังสินค้าจ่าย/อนุมัติอะไหล่ (สถานะเปลี่ยนเป็น ISSUED และหักสต๊อก)' })
    issueParts(
        @Param('id') id: string,
        @Body() dto: IssuePartRequisitionDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.requisitionsService.issueParts(+id, user.userId, dto);
    }

    @Patch(':id/reject')
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER', 'FOREMAN')
    @ApiOperation({ summary: 'คลังสินค้าปฏิเสธการขอเบิกอะไหล่ (สถานะเปลี่ยนเป็น REJECTED)' })
    rejectRequest(
        @Param('id') id: string,
        @Body() dto: IssuePartRequisitionDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.requisitionsService.rejectRequest(+id, user.userId, dto.notes);
    }

    @Post('request')
    @Roles('TECHNICIAN', 'FOREMAN', 'MANAGER', 'ADMIN')
    @ApiOperation({ summary: 'ช่างขอเบิกอะไหล่เพิ่ม (ระหว่างรอซ่อม)' })
    requestParts(@Body() dto: RequestPartsDto, @CurrentUser() user: UserPayload) {
        return this.requisitionsService.requestParts(user.userId, dto);
    }

    @Post('return')
    @Roles('TECHNICIAN', 'FOREMAN', 'MANAGER', 'ADMIN')
    @ApiOperation({ summary: 'ช่างคืนอะไหล่หลังซ่อมเสร็จ (คืนสต็อก)' })
    returnParts(@Body() dto: ReturnPartsDto, @CurrentUser() user: UserPayload) {
        return this.requisitionsService.returnParts(user.userId, dto);
    }
}
