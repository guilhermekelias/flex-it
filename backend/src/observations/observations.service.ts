import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Observation } from './entities/observation.entity';

export type CreateObservationData = {
  message?: string;
};

@Injectable()
export class ObservationsService {
  constructor(
    @InjectRepository(Observation)
    private readonly observationsRepository: Repository<Observation>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async createForStudent(
    studentId: number,
    professionalId: number,
    data: CreateObservationData,
  ): Promise<Observation> {
    const message = this.normalizeMessage(data.message);
    await this.findProfessionalStudentOrFail(studentId, professionalId);

    const observation = this.observationsRepository.create({
      message,
      studentId,
      professionalId,
    });

    return this.observationsRepository.save(observation);
  }

  async findByStudentForProfessional(
    studentId: number,
    professionalId: number,
  ): Promise<Observation[]> {
    await this.findProfessionalStudentOrFail(studentId, professionalId);

    return this.observationsRepository.find({
      where: {
        studentId,
        professionalId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findForStudentUser(email: string): Promise<Observation[]> {
    const normalizedEmail = this.normalizeEmail(email);

    if (!normalizedEmail) {
      throw new NotFoundException('Aluno vinculado ao usuario nao encontrado');
    }

    const students = await this.studentsRepository.find({
      where: {
        email: Raw((alias) => `LOWER(TRIM(${alias})) = :email`, {
          email: normalizedEmail,
        }),
      },
    });

    if (students.length === 0) {
      throw new NotFoundException('Aluno vinculado ao usuario nao encontrado');
    }

    if (students.length > 1) {
      throw new ForbiddenException('Aluno vinculado ao usuario de forma ambigua');
    }

    return this.observationsRepository.find({
      where: {
        studentId: students[0].id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  private normalizeMessage(message?: string): string {
    const normalizedMessage = message?.trim();

    if (!normalizedMessage) {
      throw new BadRequestException('Observacao nao pode ficar vazia');
    }

    return normalizedMessage;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async findProfessionalStudentOrFail(
    studentId: number,
    professionalId: number,
  ): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: {
        id: studentId,
        professionalId,
      },
    });

    if (!student) {
      throw new NotFoundException('Aluno nao encontrado');
    }

    return student;
  }
}
