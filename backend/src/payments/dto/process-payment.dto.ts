import { IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class ProcessPaymentDto {
    @ApiProperty({ description: 'จำนวนเงินที่รับมา' })
    @IsNumber()
    @Min(0)
    amountReceived: number;

    @ApiPropertyOptional({ enum: PaymentMethod, description: 'วิธีชำระเงิน' })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;
}
