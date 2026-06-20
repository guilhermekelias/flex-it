import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StudentProfessionalRecord } from '../../common/entities/student-professional-record.entity';

export type WorkoutExercise = {
  name: string;
  sets: number | null;
  reps: string | null;
  rest: string | null;
  notes: string | null;
};

@Entity('workouts')
export class Workout extends StudentProfessionalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 100 })
  type: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'exercises_count', type: 'int' })
  exercisesCount: number;

  @Column({
    name: 'exercises',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  exercises: WorkoutExercise[];
}
