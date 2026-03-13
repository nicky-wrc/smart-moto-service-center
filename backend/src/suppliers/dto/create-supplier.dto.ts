import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'บ.อะไหล่มอเตอร์ไซค์ จำกัด' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'คุณสมชาย' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ example: '0891234567' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'supplier@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '123/45 ถ.พระราม 2' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '0105550123456' })
  @IsOptional()
  @IsString()
  taxId?: string;
}
