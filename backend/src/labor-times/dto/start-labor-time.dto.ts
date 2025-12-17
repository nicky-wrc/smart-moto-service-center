import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class StartLaborTimeDto {
  @ApiProperty({ example: 7, description: 'ID ของ Job' })
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @ApiProperty({ example: 'ตรวจสอบและซ่อมเครื่องยนต์', description: 'รายละเอียดงาน' })
  @IsString()
  @IsNotEmpty()
  taskDescription: string;

  @ApiProperty({ example: 500, description: 'อัตราค่าแรงต่อชั่วโมง' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  hourlyRate: number;

  @ApiPropertyOptional({ example: 60, description: 'เวลามาตรฐาน (นาที)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  standardMinutes?: number;
}


