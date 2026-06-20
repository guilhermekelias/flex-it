import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StudentProfessionalRecord } from '../../common/entities/student-professional-record.entity';

export type NutritionPlanFood = {
  name: string;
  quantity: string | null;
  calories: number | null;
};

export type NutritionPlanMeal = {
  name: string;
  time: string | null;
  foods: NutritionPlanFood[];
};

@Entity('nutrition_plans')
export class NutritionPlan extends StudentProfessionalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 150 })
  objective: string;

  @Column({ type: 'int' })
  calories: number;

  @Column({ name: 'protein_grams', type: 'int' })
  proteinGrams: number;

  @Column({ name: 'carbs_grams', type: 'int' })
  carbsGrams: number;

  @Column({ name: 'fat_grams', type: 'int' })
  fatGrams: number;

  @Column({ name: 'meals_count', type: 'int' })
  mealsCount: number;

  @Column({
    name: 'meals',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  meals: NutritionPlanMeal[];

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
