import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsInt,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: '0812345678' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'นาย' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'สมชาย' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'ใจดี' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '123 ถ.สุขุมวิท กทม.' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  taxId?: string;
}
