import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class QuotationItemDto {
  @ApiProperty({ example: 'PART', enum: ['PART', 'PACKAGE', 'LABOR'], description: 'ประเภทรายการ (PART, PACKAGE, LABOR)' })
  @IsString()
  @IsNotEmpty()
  itemType: string;

  @ApiProperty({ example: 'ผ้าเบรกหน้า', description: 'ชื่อรายการ' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ example: 2, description: 'จำนวน' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 500, description: 'ราคาต่อหน่วย (บาท)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 1, description: 'ID ของ Part (ถ้า itemType เป็น PART)' })
  @IsOptional()
  @IsInt()
  partId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID ของ Package (ถ้า itemType เป็น PACKAGE)' })
  @IsOptional()
  @IsInt()
  packageId?: number;
}


