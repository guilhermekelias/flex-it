import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Student } from '../students/entities/student.entity';
import { Metric } from './entities/metric.entity';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Metric, Student]), AuthModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
