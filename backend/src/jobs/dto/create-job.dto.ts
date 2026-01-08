import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { JobType } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ example: 1, description: 'ID ของรถมอเตอร์ไซค์ที่จะซ่อม' })
  @IsInt()
  @IsNotEmpty()
  motorcycleId: number;

  @ApiProperty({ example: 'เครื่องสตาร์ทไม่ติด มีเสียงดังแก๊กๆ' })
  @IsString()
  @IsNotEmpty()
  symptom: string;

  @ApiProperty({ example: 'NORMAL', enum: JobType })
  @IsEnum(JobType)
  @IsNotEmpty()
  jobType: JobType;

  @ApiPropertyOptional({ example: 50, description: 'ระดับน้ำมัน %' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  fuelLevel?: number;

  @ApiPropertyOptional({ example: 'หมวกกันน็อค 1 ใบ' })
  @IsOptional()
  @IsString()
  valuables?: string;
}
