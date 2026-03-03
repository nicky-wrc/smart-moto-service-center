import { Module } from '@nestjs/common';
import { PartRequisitionsController } from './part-requisitions.controller';
import { PartRequisitionsService } from './part-requisitions.service';

@Module({
  controllers: [PartRequisitionsController],
  providers: [PartRequisitionsService]
})
export class PartRequisitionsModule {}
