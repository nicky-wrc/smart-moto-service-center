import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReceiptItemDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  partId: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batchNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  notes?: string;
}

export class CreateReceiptDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptNo?: string; // Auto-generate if not provided

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierInvoiceNo?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiptDate: string; // ISO date string

  @ApiProperty({ type: [CreateReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items: CreateReceiptItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
