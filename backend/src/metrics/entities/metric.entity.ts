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

@Entity('metrics')
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'weight_kg', type: 'double precision', nullable: true })
  weightKg: number | null;

  @Column({ name: 'height_cm', type: 'double precision', nullable: true })
  heightCm: number | null;

  @Column({ name: 'body_fat_percentage', type: 'double precision', nullable: true })
  bodyFatPercentage: number | null;

  @Column({ name: 'muscle_mass_kg', type: 'double precision', nullable: true })
  muscleMassKg: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'recorded_at', type: 'timestamp' })
  recordedAt: Date;

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
