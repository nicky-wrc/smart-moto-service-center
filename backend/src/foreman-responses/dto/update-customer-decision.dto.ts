import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsInt } from 'class-validator';

export enum CustomerDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateCustomerDecisionDto {
  @ApiProperty({ 
    description: 'Customer decision',
    enum: CustomerDecision 
  })
  @IsEnum(CustomerDecision)
  decision: CustomerDecision;

  @ApiPropertyOptional({ description: 'Optional notes from reception' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Reception user ID who recorded the decision' })
  @IsInt()
  decisionByUserId: number;
}
