import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

class RequestPartItemDto {
    @ApiProperty({ example: 1, description: 'ID ของอะไหล่ที่ต้องการเบิก' })
    @IsInt()
    @IsNotEmpty()
    partId: number;

    @ApiProperty({ example: 2, description: 'จำนวนที่ต้องการเบิก' })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    quantity: number;
}

export class RequestPartsDto {
    @ApiProperty({ example: 1, description: 'ID ของ Job ปัจจุบันที่กำลังซ่อม' })
    @IsInt()
    @IsNotEmpty()
    jobId: number;

    @ApiPropertyOptional({ example: 'พบลูกปืนล้อแตกเพิ่ม', description: 'หมายเหตุการเบิกเพิ่ม' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ type: [RequestPartItemDto], description: 'รายการอะไหล่ที่ขอเบิก' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RequestPartItemDto)
    items: RequestPartItemDto[];
}
