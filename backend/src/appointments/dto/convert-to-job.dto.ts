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

export class AppointmentConvertToJobDto {
  @ApiProperty({
    example: 'เครื่องสตาร์ทไม่ติด มีเสียงดังแก๊กๆ',
    description: 'อาการของรถ',
  })
  @IsString()
  @IsNotEmpty()
  symptom: string;

  @ApiPropertyOptional({
    example: 'NORMAL',
    enum: JobType,
    description: 'ประเภทของงาน (NORMAL, FAST_TRACK)',
  })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

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
