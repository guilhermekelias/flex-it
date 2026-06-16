import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  async findForStudentUser(userId: number): Promise<Observation[]> {
    const students = await this.studentsRepository.find({
      where: {
        userId,
      },
    });

    if (students.length === 0) {
      throw new NotFoundException('Aluno vinculado ao usuario nao encontrado');
    }

    const studentIds = students.map((student) => student.id);

    return this.observationsRepository.find({
      where: {
        studentId: In(studentIds),
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
