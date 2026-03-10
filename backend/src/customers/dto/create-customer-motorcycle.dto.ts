import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class MotorcycleDto {
    @ApiProperty({ example: '1 กข 1234 กทม' })
    @IsString()
    @IsNotEmpty()
    licensePlate: string;

    @ApiProperty({ example: 'Honda' })
    @IsString()
    @IsNotEmpty()
    brand: string;

    @ApiProperty({ example: 'Wave 125i' })
    @IsString()
    @IsNotEmpty()
    model: string;

    @ApiProperty({ example: 'แดง-ดำ' })
    @IsString()
    @IsNotEmpty()
    color: string;

    @ApiPropertyOptional({ example: 'VIN1234567890' })
    @IsOptional()
    @IsString()
    vin?: string;

    @ApiPropertyOptional({ example: 2023 })
    @IsOptional()
    @IsNumber()
    year?: number;

    @ApiPropertyOptional({ example: 'ENG0987654321' })
    @IsOptional()
    @IsString()
    engineNo?: string;

    @ApiPropertyOptional({ example: 15400 })
    @IsOptional()
    @IsNumber()
    mileage?: number;
}

export class CreateCustomerWithMotorcycleDto {
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

    @ApiProperty({ type: MotorcycleDto })
    @IsDefined()
    @ValidateNested()
    @Type(() => MotorcycleDto)
    motorcycle: MotorcycleDto;
}
