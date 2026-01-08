import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { MotorcyclesModule } from './motorcycles/motorcycles.module';
import { JobsModule } from './jobs/jobs.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { WarrantiesModule } from './warranties/warranties.module';
import { LaborTimesModule } from './labor-times/labor-times.module';
import { OutsourcesModule } from './outsources/outsources.module';
import { JobChecklistsModule } from './job-checklists/job-checklists.module';
import { PartsModule } from './parts/parts.module';
import { PaymentsModule } from './payments/payments.module';
import { QuotationsModule } from './quotations/quotations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CustomersModule,
    MotorcyclesModule,
    JobsModule,
    AppointmentsModule,
    WarrantiesModule,
    LaborTimesModule,
    OutsourcesModule,
    JobChecklistsModule,
    PartsModule,
    PaymentsModule,
    QuotationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
