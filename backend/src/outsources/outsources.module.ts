import { Module } from '@nestjs/common';
import { OutsourcesService } from './outsources.service';
import { OutsourcesController } from './outsources.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OutsourcesController],
  providers: [OutsourcesService],
  exports: [OutsourcesService],
})
export class OutsourcesModule {}


