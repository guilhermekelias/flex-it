import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  age: number;

  @Column()
  goal: string; // ex: emagrecimento, hipertrofia

  @Column({ name: 'professional_id', nullable: true })
  professionalId: number | null;

  @ManyToOne(() => User, (user) => user.students, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'professional_id' })
  professional: User | null;
}
