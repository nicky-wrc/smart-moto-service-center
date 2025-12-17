import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1, description: 'ID ของรถมอเตอร์ไซค์' })
  @IsInt()
  @IsNotEmpty()
  motorcycleId: number;

  @ApiProperty({ example: '2025-12-25', description: 'วันที่นัดหมาย (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiProperty({ example: '10:00', description: 'เวลานัดหมาย (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  scheduledTime: string;

  @ApiPropertyOptional({ example: 'นัดเช็คระยะ 5,000 กม.' })
  @IsOptional()
  @IsString()
  notes?: string;
}


