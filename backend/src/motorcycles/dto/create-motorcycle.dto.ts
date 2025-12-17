import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateMotorcycleDto {
  @ApiProperty({ example: 'MM123456789' })
  @IsString()
  @IsNotEmpty()
  vin: string;

  @ApiProperty({ example: '1กข-1234' })
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty({ example: 'Honda' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Wave 110i' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 'แดง-ขาว' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 'E123-45678' })
  @IsOptional()
  @IsString()
  engineNo?: string;

  @ApiProperty({ example: 1, description: 'ID ของลูกค้าเจ้าของรถ' })
  @IsInt()
  @IsNotEmpty()
  ownerId: number;
}
