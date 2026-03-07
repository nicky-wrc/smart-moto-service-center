import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    Min,
    ValidateNested,
} from 'class-validator';

class ReturnPartItemDto {
    @ApiProperty({ example: 1, description: 'ID ของอะไหล่ที่ต้องการคืน (ต้องเคยเบิกในใบเบิกนี้)' })
    @IsInt()
    @IsNotEmpty()
    partId: number;

    @ApiProperty({ example: 1, description: 'จำนวนที่จะคืนหน้างาน (ไม่เกินที่เบิกไป)' })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    returnQuantity: number;
}

export class ReturnPartsDto {
    @ApiProperty({ example: 1, description: 'ID ของใบเบิก (PartRequisition) ต้นทาง' })
    @IsInt()
    @IsNotEmpty()
    requisitionId: number;

    @ApiProperty({ type: [ReturnPartItemDto], description: 'รายการอะไหล่ที่ต้องการคืน' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReturnPartItemDto)
    items: ReturnPartItemDto[];
}
