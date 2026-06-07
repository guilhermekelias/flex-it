import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Student } from '../students/entities/student.entity';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import { NutritionPlansController } from './nutrition-plans.controller';
import { NutritionPlansService } from './nutrition-plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionPlan, Student]), AuthModule],
  controllers: [NutritionPlansController],
  providers: [NutritionPlansService],
})
export class NutritionPlansModule {}
