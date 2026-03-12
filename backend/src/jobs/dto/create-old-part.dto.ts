import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsEnum,
  Min,
} from 'class-validator';

export enum OldPartActionEnum {
  RETURN_CUSTOMER = 'RETURN_CUSTOMER',
  DISPOSE = 'DISPOSE',
  KEEP_EVIDENCE = 'KEEP_EVIDENCE',
}

export class CreateOldPartDto {
  @ApiProperty({ example: 'ลูกสูบเก่า' })
  @IsString()
  @IsNotEmpty()
  partName: string;

  @ApiPropertyOptional({ example: 'ลูกสูบเบอร์ 0, สึกหรอ' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ example: 'RETURN_CUSTOMER', enum: OldPartActionEnum })
  @IsEnum(OldPartActionEnum)
  action: OldPartActionEnum;

  @ApiPropertyOptional({ example: ['http://example.com/photo.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ example: 'คืนลูกค้าพร้อมรถ' })
  @IsOptional()
  @IsString()
  notes?: string;
}
