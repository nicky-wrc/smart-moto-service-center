import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateServiceReminderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reminderType: string; // e.g., 'OIL_CHANGE', 'MAINTENANCE', 'TUNE_UP'

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  dueMileage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  dueDate?: string; // ISO date string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  intervalMiles?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  intervalDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  lastServiceMileage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  lastServiceDate?: string; // ISO date string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
