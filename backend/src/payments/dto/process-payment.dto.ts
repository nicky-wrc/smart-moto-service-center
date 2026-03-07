import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
    @ApiProperty({ description: 'จำนวนเงินที่รับมา' })
    @IsNumber()
    @Min(0)
    amountReceived: number;
}
