import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsInt,
    IsOptional,
    IsArray,
    ValidateNested,
    IsNumber,
    IsDateString,
    IsString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseOrderItemDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    partId: number;

    @ApiProperty({ example: 10 })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiProperty({ example: 150.0 })
    @IsNumber()
    @Min(0)
    unitPrice: number;
}

export class CreatePurchaseOrderDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    supplierId: number;

    @ApiProperty({ type: [PurchaseOrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PurchaseOrderItemDto)
    items: PurchaseOrderItemDto[];

    @ApiPropertyOptional({ example: 'สั่งซื้ออะไหล่เพิ่มเติม' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ example: '2026-03-10' })
    @IsOptional()
    @IsDateString()
    expectedDate?: string;
}
