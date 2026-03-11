import { PartialType } from '@nestjs/swagger';
import { CreateForemanResponseDto } from './create-foreman-response.dto';

export class UpdateForemanResponseDto extends PartialType(CreateForemanResponseDto) {}
