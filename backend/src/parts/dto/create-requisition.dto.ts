import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequisitionItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  partId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  packageId?: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRequisitionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jobId?: number;

  @ApiProperty({ type: [CreateRequisitionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequisitionItemDto)
  items: CreateRequisitionItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
