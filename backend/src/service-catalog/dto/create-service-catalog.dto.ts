import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class CreateServiceCatalogDto {
    @ApiProperty({ example: 'เปลี่ยนน้ำมันเครื่อง' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 100, description: 'ค่าแรง (บาท)' })
    @IsNumber()
    @Min(0)
    laborCost: number;

    @ApiPropertyOptional({ example: 'บำรุงรักษา' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: ['เครื่องยนต์', 'บำรุงรักษา'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
