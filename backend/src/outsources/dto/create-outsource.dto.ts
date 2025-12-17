import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOutsourceDto {
  @ApiProperty({ example: 7, description: 'ID ของ Job' })
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @ApiProperty({ example: 'ร้านซ่อมสี ABC', description: 'ชื่อร้าน/ผู้รับเหมา' })
  @IsString()
  @IsNotEmpty()
  vendorName: string;

  @ApiProperty({ example: 'พ่นสีใหม่ทั้งคัน', description: 'รายละเอียดงาน' })
  @IsString()
  @IsNotEmpty()
  workDescription: string;

  @ApiProperty({ example: 5000, description: 'ต้นทุน (บาท)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  cost: number;

  @ApiPropertyOptional({ example: 6000, description: 'ราคาขาย (บาท) หากไม่ระบุจะคำนวณเป็น cost + 20%' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({ example: 3, description: 'จำนวนวันที่คาดว่าจะเสร็จ' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDays?: number;

  @ApiPropertyOptional({ example: 'ร้านอยู่ใกล้ๆ สามารถส่งได้ภายใน 3 วัน' })
  @IsOptional()
  @IsString()
  notes?: string;
}


