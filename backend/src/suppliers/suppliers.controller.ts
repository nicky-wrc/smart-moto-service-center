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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Suppliers (ผู้จำหน่าย)')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('suppliers')
export class SuppliersController {
    constructor(private readonly service: SuppliersService) { }

    @Post()
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'เพิ่ม Supplier ใหม่' })
    create(@Body() dto: CreateSupplierDto) {
        return this.service.create(dto);
    }

    @Get()
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'ดูรายการ Suppliers' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    findAll(
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.service.findAll({
            search,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
        });
    }

    @Get(':id')
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'ดูรายละเอียด Supplier' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Patch(':id')
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'แก้ไขข้อมูล Supplier' })
    update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
        return this.service.update(+id, dto);
    }

    @Delete(':id')
    @Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'ปิดการใช้งาน Supplier' })
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
