import { Module } from '@nestjs/common';
import { PurchaseReceivesController } from './purchase-receives.controller';
import { PurchaseReceivesService } from './purchase-receives.service';

@Module({
  controllers: [PurchaseReceivesController],
  providers: [PurchaseReceivesService],
  exports: [PurchaseReceivesService],
})
export class PurchaseReceivesModule {}
