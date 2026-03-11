import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { ServiceRemindersService } from './service-reminders.service';
import { ServiceRemindersController } from './service-reminders.controller';
import { ServiceHistoryService } from './service-history.service';
import { ServiceHistoryController } from './service-history.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    CustomersController,
    PointsController,
    ServiceRemindersController,
    ServiceHistoryController,
  ],
  providers: [
    CustomersService,
    PointsService,
    ServiceRemindersService,
    ServiceHistoryService,
  ],
  exports: [
    CustomersService,
    PointsService,
    ServiceRemindersService,
    ServiceHistoryService,
  ],
})
export class CustomersModule {}
