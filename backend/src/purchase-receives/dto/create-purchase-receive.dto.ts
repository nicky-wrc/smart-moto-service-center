import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsInt,
    IsOptional,
    IsArray,
    ValidateNested,
    IsString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReceiveItemDto {
    @ApiProperty({ example: 1, description: 'PO Item ID' })
    @IsInt()
    purchaseOrderItemId: number;

    @ApiProperty({ example: 5, description: 'จำนวนที่รับจริง' })
    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreatePurchaseReceiveDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    purchaseOrderId: number;

    @ApiProperty({ type: [ReceiveItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReceiveItemDto)
    items: ReceiveItemDto[];

    @ApiPropertyOptional({ example: 'INV-2026-001', description: 'เลขที่ใบกำกับภาษี' })
    @IsOptional()
    @IsString()
    invoiceNo?: string;

    @ApiPropertyOptional({ example: 'สินค้าครบตามสั่ง' })
    @IsOptional()
    @IsString()
    notes?: string;
}
