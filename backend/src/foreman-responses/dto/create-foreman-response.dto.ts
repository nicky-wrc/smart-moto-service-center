import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class RequiredPartDto {
  @ApiPropertyOptional({ description: 'Part ID if exists in inventory' })
  @IsOptional()
  @IsInt()
  partId?: number;

  @ApiProperty({ description: 'Part name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Quantity needed' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Total price (quantity * unitPrice)' })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiPropertyOptional({ description: 'Part number' })
  @IsOptional()
  @IsString()
  partNumber?: string;

  @ApiPropertyOptional({ description: 'Supplier name' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({ description: 'Whether part is in stock' })
  @IsOptional()
  inStock?: boolean;
}

export class CreateForemanResponseDto {
  @ApiProperty({ description: 'Job ID' })
  @IsInt()
  jobId: number;

  @ApiProperty({ description: 'Foreman analysis/diagnosis' })
  @IsString()
  foremanAnalysis: string;

  @ApiProperty({ description: 'Estimated repair cost' })
  @IsNumber()
  @Min(0)
  estimatedCost: number;

  @ApiProperty({ description: 'Estimated duration (e.g., "2-3 วัน")' })
  @IsString()
  estimatedDuration: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiProperty({ description: 'Foreman user ID' })
  @IsInt()
  foremanId: number;

  @ApiProperty({ description: 'Required parts for repair', type: [RequiredPartDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredPartDto)
  requiredParts: RequiredPartDto[];

  @ApiPropertyOptional({ description: 'Assessment number (defaults to 1)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  assessmentNumber?: number;
}
