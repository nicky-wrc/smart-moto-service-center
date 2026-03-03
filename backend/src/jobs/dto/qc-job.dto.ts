import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QcJobDto {
    @ApiProperty({ description: 'ผ่าน QC หรือไม่' })
    @IsBoolean()
    passed: boolean;

    @ApiPropertyOptional({ description: 'หมายเหตุการตรวจ (เช่น จุดที่ต้องแก้)' })
    @IsOptional()
    @IsString()
    notes?: string;
}
