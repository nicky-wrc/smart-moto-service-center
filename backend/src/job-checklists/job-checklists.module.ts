import { Module } from '@nestjs/common';
import { JobChecklistsService } from './job-checklists.service';
import { JobChecklistsController } from './job-checklists.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobChecklistsController],
  providers: [JobChecklistsService],
  exports: [JobChecklistsService],
})
export class JobChecklistsModule {}

