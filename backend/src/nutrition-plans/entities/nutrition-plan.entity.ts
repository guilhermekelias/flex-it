import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

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
export class NutritionPlan {
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

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'professional_id' })
  professionalId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'professional_id' })
  professional: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
