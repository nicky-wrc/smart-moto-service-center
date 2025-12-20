import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsInt,
} from 'class-validator';

export class CreatePartDto {
  @ApiProperty({ example: 'PART-001', description: 'รหัสอะไหล่' })
  @IsString()
  @IsNotEmpty()
  partNo: string;

  @ApiProperty({ example: 'ผ้าเบรกหน้า', description: 'ชื่ออะไหล่' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'ผ้าเบรกหน้า Honda PCX 160',
    description: 'รายละเอียด',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Honda', description: 'ยี่ห้อ' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'เบรก', description: 'หมวดหมู่' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'ชิ้น',
    description: 'หน่วยนับ',
    default: 'ชิ้น',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 500, description: 'ราคาต่อหน่วย (บาท)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'จำนวนสต็อกเริ่มต้น',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'จุดสั่งซื้อใหม่ (Reorder Point)',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'จำนวนที่สั่งซื้อเมื่อถึง Reorder Point',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderQuantity?: number;
}
