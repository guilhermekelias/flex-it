import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type ValueTransformer,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

export enum ObservationSenderRole {
  PROFESSIONAL = 'professional',
  STUDENT = 'student',
}

const postgresTimestampAsUtcTransformer: ValueTransformer = {
  to: (value: unknown) => value,
  from: (value: unknown) => {
    if (!(value instanceof Date)) {
      return value;
    }

    // PostgreSQL TIMESTAMP has no timezone; treat the stored wall-clock value as UTC.
    return new Date(
      Date.UTC(
        value.getFullYear(),
        value.getMonth(),
        value.getDate(),
        value.getHours(),
        value.getMinutes(),
        value.getSeconds(),
        value.getMilliseconds(),
      ),
    );
  },
};

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

  @CreateDateColumn({
    name: 'created_at',
    transformer: postgresTimestampAsUtcTransformer,
  })
  createdAt: Date;
}
