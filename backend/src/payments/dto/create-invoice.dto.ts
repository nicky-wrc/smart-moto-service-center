import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  jobId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
