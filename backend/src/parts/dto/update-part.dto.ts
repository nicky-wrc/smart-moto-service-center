import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsInt, IsBoolean } from 'class-validator';

export class UpdatePartDto {
  @ApiPropertyOptional({ example: 'ผ้าเบรกหน้า', description: 'ชื่ออะไหล่' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'ผ้าเบรกหน้า Honda PCX 160', description: 'รายละเอียด' })
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

  @ApiPropertyOptional({ example: 'ชิ้น', description: 'หน่วยนับ' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 500, description: 'ราคาต่อหน่วย (บาท)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ example: 5, description: 'จุดสั่งซื้อใหม่ (Reorder Point)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({ example: 20, description: 'จำนวนที่สั่งซื้อเมื่อถึง Reorder Point' })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderQuantity?: number;

  @ApiPropertyOptional({ example: true, description: 'สถานะการใช้งาน' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


