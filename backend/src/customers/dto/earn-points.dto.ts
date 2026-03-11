import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class EarnPointsDto {
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
  amount?: number; // Purchase amount (for calculating points)

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string; // paymentNo, jobNo, etc.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
