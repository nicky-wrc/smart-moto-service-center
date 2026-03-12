import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class RequestInspectionDto {
  @ApiProperty({
    example: 800,
    description: 'ค่าตรวจสอบเชิงลึก / ค่าผ่าเครื่อง (บาท)',
  })
  @IsNumber()
  @Min(0)
  inspectionFee: number;

  @ApiPropertyOptional({
    example: 'ต้องรื้อเครื่องเพื่อตรวจสอบอาการเครื่องสะดุด',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
