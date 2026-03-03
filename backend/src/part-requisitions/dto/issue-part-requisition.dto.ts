import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class IssuePartRequisitionDto {
    @ApiPropertyOptional({ description: 'หมายเหตุเพิ่มเติมจากคลังสินค้า' })
    @IsOptional()
    @IsString()
    notes?: string;
}
