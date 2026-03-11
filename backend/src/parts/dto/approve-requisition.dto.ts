import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveRequisitionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
