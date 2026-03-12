import { PartialType } from '@nestjs/swagger';
import { CreateServiceCatalogDto } from './create-service-catalog.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceCatalogDto extends PartialType(
  CreateServiceCatalogDto,
) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
