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
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { UserPayload } from '../common/decorators/user.decorator';
import { POStatus } from '@prisma/client';

@ApiTags('Purchase Orders (ใบสั่งซื้อ)')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('purchase-orders')
export class PurchaseOrdersController {
    constructor(private readonly service: PurchaseOrdersService) { }

    @Post()
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'สร้างใบสั่งซื้อ (PO)' })
    create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: UserPayload) {
        return this.service.create(user.userId, {
            ...dto,
            expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        });
    }

    @Get()
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'ดูรายการ PO ทั้งหมด' })
    @ApiQuery({ name: 'status', required: false, enum: POStatus })
    @ApiQuery({ name: 'supplierId', required: false, type: Number })
    @ApiQuery({ name: 'dateFrom', required: false })
    @ApiQuery({ name: 'dateTo', required: false })
    findAll(
        @Query('status') status?: POStatus,
        @Query('supplierId') supplierId?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
    ) {
        const filters: any = {};
        if (status) filters.status = status;
        if (supplierId) filters.supplierId = +supplierId;
        if (dateFrom) filters.dateFrom = new Date(dateFrom);
        if (dateTo) filters.dateTo = new Date(dateTo);
        return this.service.findAll(filters);
    }

    @Get(':id')
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'ดูรายละเอียด PO' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Patch(':id')
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'แก้ไข PO (เฉพาะ DRAFT)' })
    update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
        return this.service.update(+id, {
            ...dto,
            expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        });
    }

    @Patch(':id/submit')
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'ส่ง PO (เข้าสู่สถานะรอเจ้าของร้าน/ผู้จัดการอนุมัติ)' })
    submit(@Param('id') id: string) {
        return this.service.submit(+id);
    }

    @Patch(':id/approve')
    @Roles('MANAGER', 'ADMIN')
    @ApiOperation({ summary: 'เจ้าของร้านอนุมัติ PO' })
    approve(@Param('id') id: string, @CurrentUser() user: UserPayload) {
        return this.service.approve(+id, user.userId);
    }

    @Patch(':id/cancel')
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'ยกเลิก PO' })
    cancel(@Param('id') id: string) {
        return this.service.cancel(+id);
    }
}
