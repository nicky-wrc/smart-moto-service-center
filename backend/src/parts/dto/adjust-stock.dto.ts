import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ example: 10, description: 'จำนวนที่ต้องการปรับ (บวก = เพิ่ม, ลบ = ลด)' })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({ example: 'ปรับสต็อกจากการตรวจนับ', description: 'หมายเหตุ' })
  @IsOptional()
  @IsString()
  notes?: string;
}


