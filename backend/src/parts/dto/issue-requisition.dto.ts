import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class IssueRequisitionItemDto {
  @ApiProperty()
  @IsNumber()
  itemId: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  issuedQuantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class IssueRequisitionDto {
  @ApiProperty({ type: [IssueRequisitionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IssueRequisitionItemDto)
  items: IssueRequisitionItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
