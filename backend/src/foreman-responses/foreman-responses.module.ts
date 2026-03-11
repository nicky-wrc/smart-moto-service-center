import { Module } from '@nestjs/common';
import { ForemanResponsesService } from './foreman-responses.service';
import { ForemanResponsesController } from './foreman-responses.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ForemanResponsesController],
  providers: [ForemanResponsesService],
  exports: [ForemanResponsesService],
})
export class ForemanResponsesModule {}
