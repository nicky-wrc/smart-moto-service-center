import { IsOptional, IsArray, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReadyDeliveryJobDto {
  @ApiPropertyOptional({
    description: 'รูปภาพหลังล้างรถ/พร้อมส่งมอบ',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ description: 'หมายเหตุก่อนส่งมอบ' })
  @IsOptional()
  @IsString()
  notes?: string;
}
