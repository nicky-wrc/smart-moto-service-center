import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsArray, ValidateNested, IsString, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { QuotationItemDto } from './quotation-item.dto';

export class CreateQuotationDto {
  @ApiProperty({ example: 5, description: 'ID ของ Customer' })
  @IsInt()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ example: 6, description: 'ID ของ Motorcycle' })
  @IsInt()
  @IsNotEmpty()
  motorcycleId: number;

  @ApiProperty({
    type: [QuotationItemDto],
    example: [
      {
        itemType: 'PART',
        itemName: 'ผ้าเบรกหน้า',
        quantity: 2,
        unitPrice: 500,
        partId: 1,
      },
      {
        itemType: 'LABOR',
        itemName: 'เปลี่ยนผ้าเบรกหน้า',
        quantity: 1,
        unitPrice: 300,
      },
    ],
    description: 'รายการใน Quotation',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z', description: 'วันหมดอายุของ Quotation (ISO date string)' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ example: 'ขอเสนอราคาสำหรับซ่อมเบรก', description: 'หมายเหตุ' })
  @IsOptional()
  @IsString()
  notes?: string;
}

