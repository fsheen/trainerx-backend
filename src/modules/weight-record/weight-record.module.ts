import { Module } from '@nestjs/common';
import { WeightRecordController } from './weight-record.controller';
import { WeightRecordService } from './weight-record.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WeightRecordController],
  providers: [WeightRecordService],
  exports: [WeightRecordService],
})
export class WeightRecordModule {}
