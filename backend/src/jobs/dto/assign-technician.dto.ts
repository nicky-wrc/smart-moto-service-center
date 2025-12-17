import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignTechnicianDto {
  @ApiProperty({ example: 6, description: 'ID ของช่างที่จะมอบหมายงานให้' })
  @IsInt()
  @IsNotEmpty()
  technicianId: number;
}


