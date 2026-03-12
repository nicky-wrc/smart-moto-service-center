import { IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ReturnPartItemDto {
  @IsNumber()
  quotationItemId: number;

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
