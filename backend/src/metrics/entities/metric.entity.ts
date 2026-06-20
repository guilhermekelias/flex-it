import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StudentProfessionalRecord } from '../../common/entities/student-professional-record.entity';

@Entity('metrics')
export class Metric extends StudentProfessionalRecord {
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
}
