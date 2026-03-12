import { IsArray, ValidateNested, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ReturnPartItemDto {
  @IsOptional()
  @IsNumber()
  quotationItemId?: number;

  @IsOptional()
  @IsNumber()
  requisitionItemId?: number;

  @IsNumber()
  @Min(0)
  actualQuantity: number;
}

export class ReturnPartsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnPartItemDto)
  partsActual: ReturnPartItemDto[];
}
