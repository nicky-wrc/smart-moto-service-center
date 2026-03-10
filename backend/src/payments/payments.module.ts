import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [PrismaModule, CustomersModule],
  controllers: [PaymentsController, InvoicesController],
  providers: [PaymentsService, InvoicesService],
  exports: [PaymentsService, InvoicesService],
})
export class PaymentsModule {}
