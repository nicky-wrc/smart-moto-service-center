import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuotationItemDto } from './quotation-item.dto';

export class UpdateQuotationDto {
  @ApiPropertyOptional({
    type: [QuotationItemDto],
    description: 'รายการใน Quotation (อัพเดตทั้งหมด)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items?: QuotationItemDto[];

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59Z',
    description: 'วันหมดอายุของ Quotation (ISO date string)',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({
    example: 'ขอเสนอราคาสำหรับซ่อมเบรก',
    description: 'หมายเหตุ',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
