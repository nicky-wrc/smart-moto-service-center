import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class QuotationConvertToJobDto {
  @ApiProperty({ example: 'เครื่องสตาร์ทไม่ติด มีเสียงดังแก๊กๆ', description: 'อาการของรถ' })
  @IsString()
  @IsNotEmpty()
  symptom: string;
}

