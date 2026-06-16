import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

export enum ObservationSenderRole {
  PROFESSIONAL = 'professional',
  STUDENT = 'student',
}

@Entity('observations')
export class Observation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  message: string;

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

  @Column({
    name: 'sender_role',
    type: 'enum',
    enum: ObservationSenderRole,
    default: ObservationSenderRole.PROFESSIONAL,
  })
  senderRole: ObservationSenderRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
