import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSalaryDto {
    @ApiPropertyOptional({ description: 'เงินเดือนประจำ' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    baseSalary?: number;

    @ApiPropertyOptional({ description: 'ค่าคอมมิชชั่น (%)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    commissionRate?: number;
}
