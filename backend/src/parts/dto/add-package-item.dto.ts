import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddPackageItemDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  partId: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
