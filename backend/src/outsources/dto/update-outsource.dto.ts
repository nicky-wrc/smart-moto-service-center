import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsDateString, IsInt } from 'class-validator';

export class UpdateOutsourceDto {
  @ApiPropertyOptional({ example: 'ร้านซ่อมสี ABC', description: 'ชื่อร้าน/ผู้รับเหมา' })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional({ example: 'พ่นสีใหม่ทั้งคัน', description: 'รายละเอียดงาน' })
  @IsOptional()
  @IsString()
  workDescription?: string;

  @ApiPropertyOptional({ example: 5000, description: 'ต้นทุน (บาท)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ example: 6000, description: 'ราคาขาย (บาท)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({ example: 3, description: 'จำนวนวันที่คาดว่าจะเสร็จ' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDays?: number;

  @ApiPropertyOptional({ example: '2025-12-20T00:00:00Z', description: 'วันที่เสร็จสิ้นงาน' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ example: 'งานเสร็จแล้ว' })
  @IsOptional()
  @IsString()
  notes?: string;
}


