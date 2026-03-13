import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';

export enum ForemanResponseStatus {
  PENDING_CUSTOMER = 'PENDING_CUSTOMER',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class QueryForemanResponseDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ForemanResponseStatus,
  })
  @IsOptional()
  @IsEnum(ForemanResponseStatus)
  status?: ForemanResponseStatus;

  @ApiPropertyOptional({
    description: 'Search by customer name or queue number',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['respondedAt', 'queueNumber', 'assessmentNumber'],
    default: 'respondedAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'respondedAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Filter from date (ISO format)' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to date (ISO format)' })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
