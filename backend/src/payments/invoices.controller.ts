import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@ApiTags('Invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('CASHIER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'สร้าง Invoice จาก Job' })
  createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.invoicesService.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการ Invoice' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  getInvoices(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.invoicesService.findAll({
      dateFrom,
      dateTo,
      customerId: customerId ? +customerId : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดู Invoice' })
  getInvoice(@Param('id') id: string) {
    return this.invoicesService.findOne(+id);
  }
}
