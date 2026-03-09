import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IssuedItemDto {
    @ApiProperty({ description: 'ID ของรายการชิ้นส่วนในใบเบิก' })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'จำนวนที่จะให้เบิกจริง' })
    @IsNumber()
    @Min(0)
    issuedQuantity: number;
}

export class IssuePartRequisitionDto {
    @ApiPropertyOptional({ description: 'หมายเหตุเพิ่มเติมจากคลังสินค้า' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ type: [IssuedItemDto], description: 'รายการชิ้นส่วนที่อนุมัติให้เบิก (หากไม่ส่งมา จะอนุมัติตามจำนวนที่ขอเบิก 100%)' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IssuedItemDto)
    issuedItems?: IssuedItemDto[];
}
