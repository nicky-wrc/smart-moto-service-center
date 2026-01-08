import { Module } from '@nestjs/common';
import { LaborTimesService } from './labor-times.service';
import { LaborTimesController } from './labor-times.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LaborTimesController],
  providers: [LaborTimesService],
  exports: [LaborTimesService],
})
export class LaborTimesModule {}
