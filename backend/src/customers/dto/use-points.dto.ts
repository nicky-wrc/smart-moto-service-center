import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class UsePointsDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  points: number;

  @ApiPropertyOptional()
  @IsOptional()
  amount?: number; // Discount amount

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string; // paymentNo, etc.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
