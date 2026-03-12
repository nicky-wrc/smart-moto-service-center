import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { IsOptional, IsEnum, IsString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @ApiPropertyOptional({
    example: 'WAITING_APPROVAL',
    enum: JobStatus,
    description: 'สถานะของงาน',
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    example: 'ตรวจพบว่าลูกสูบสึก',
    description: 'บันทึกการวินิจฉัย (หัวหน้าช่าง)',
  })
  @IsOptional()
  @IsString()
  diagnosisNotes?: string;

  @ApiPropertyOptional({
    example: 'พบปัญหาเพิ่มเติม',
    description: 'บันทึกจากช่าง',
  })
  @IsOptional()
  @IsString()
  mechanicNotes?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID ของ Quotation ที่เชื่อมกับงาน',
  })
  @IsOptional()
  @IsInt()
  quotationId?: number;
}
