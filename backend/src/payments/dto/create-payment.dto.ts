import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 7, description: 'ID ของ Job' })
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @ApiProperty({
    example: 'CASH',
    enum: PaymentMethod,
    description: 'วิธีชำระเงิน',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 6420, description: 'ยอดรวมก่อนหักส่วนลด (บาท)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ example: 0, description: 'ส่วนลด (บาท)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ example: 0, description: 'คะแนนที่ใช้ (คะแนน)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  pointsUsed?: number;

  @ApiPropertyOptional({ example: 420, description: 'VAT 7% (บาท)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vat?: number;

  @ApiProperty({ example: 6420, description: 'ยอดรวมสุทธิ (บาท)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ example: 'ชำระเงินสด', description: 'หมายเหตุ' })
  @IsOptional()
  @IsString()
  notes?: string;
}
