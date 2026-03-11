import { Module } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { PartRequisitionsService } from './part-requisitions.service';
import { PartRequisitionsController } from './part-requisitions.controller';
import { PartPackagesService } from './part-packages.service';
import { PartPackagesController } from './part-packages.controller';
import { LostSalesService } from './lost-sales.service';
import { LostSalesController } from './lost-sales.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    PartsController,
    PartRequisitionsController,
    PartPackagesController,
    LostSalesController,
  ],
  providers: [
    PartsService,
    PartRequisitionsService,
    PartPackagesService,
    LostSalesService,
  ],
  exports: [
    PartsService,
    PartRequisitionsService,
    PartPackagesService,
    LostSalesService,
  ],
})
export class PartsModule {}
