import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { findProfessionalStudentOrFail } from '../common/students/find-professional-student';
import { Student } from '../students/entities/student.entity';
import { Observation, ObservationSenderRole } from './entities/observation.entity';

export type CreateObservationData = {
  message?: unknown;
};

export type CreateStudentObservationData = CreateObservationData & {
  studentId?: unknown;
};

export type ObservationThread = {
  studentId: number;
  professionalId: number | null;
  messages: Observation[];
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
    data: CreateObservationData = {},
  ): Promise<Observation> {
    const payload = this.getPayloadObject(data);
    const message = this.normalizeMessage(payload.message);
    await findProfessionalStudentOrFail(this.studentsRepository, studentId, professionalId);

    const observation = this.observationsRepository.create({
      message,
      studentId,
      professionalId,
      senderRole: ObservationSenderRole.PROFESSIONAL,
    });

    return this.observationsRepository.save(observation);
  }

  async createForStudentUser(
    userId: number,
    data: CreateStudentObservationData = {},
  ): Promise<Observation> {
    const payload = this.getPayloadObject(data);
    const message = this.normalizeMessage(payload.message);
    const studentId = this.normalizeStudentId(payload.studentId);
    const student = await this.findStudentLinkedToUserOrFail(studentId, userId);

    if (!student.professionalId) {
      throw new NotFoundException('Profissional vinculado ao aluno nao encontrado');
    }

    const observation = this.observationsRepository.create({
      message,
      studentId: student.id,
      professionalId: student.professionalId,
      senderRole: ObservationSenderRole.STUDENT,
    });

    return this.observationsRepository.save(observation);
  }

  async findByStudentForProfessional(
    studentId: number,
    professionalId: number,
  ): Promise<Observation[]> {
    await findProfessionalStudentOrFail(this.studentsRepository, studentId, professionalId);

    return this.observationsRepository.find({
      where: {
        studentId,
        professionalId,
      },
      order: {
        createdAt: 'ASC',
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
        createdAt: 'ASC',
      },
    });
  }

  async findThreadsForStudentUser(userId: number): Promise<ObservationThread[]> {
    const students = await this.findStudentsLinkedToUserOrFail(userId);
    const studentIds = students.map((student) => student.id);
    const observations = await this.observationsRepository.find({
      where: {
        studentId: In(studentIds),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return students.map((student) => ({
      studentId: student.id,
      professionalId: student.professionalId,
      messages: observations.filter((observation) => observation.studentId === student.id),
    }));
  }

  private getPayloadObject(data: CreateObservationData | CreateStudentObservationData) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Payload de observacao invalido');
    }

    return data as Record<string, unknown>;
  }

  private normalizeMessage(message: unknown): string {
    if (typeof message !== 'string') {
      throw new BadRequestException('Observacao nao pode ficar vazia');
    }

    const normalizedMessage = message.trim();

    if (!normalizedMessage) {
      throw new BadRequestException('Observacao nao pode ficar vazia');
    }

    return normalizedMessage;
  }

  private normalizeStudentId(studentId: unknown): number {
    if (typeof studentId !== 'number' || !Number.isInteger(studentId) || studentId <= 0) {
      throw new BadRequestException('Aluno da conversa e obrigatorio');
    }

    return studentId;
  }

  private async findStudentLinkedToUserOrFail(studentId: number, userId: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: {
        id: studentId,
        userId,
      },
    });

    if (!student) {
      throw new NotFoundException('Aluno vinculado ao usuario nao encontrado');
    }

    return student;
  }

  private async findStudentsLinkedToUserOrFail(userId: number): Promise<Student[]> {
    const students = await this.studentsRepository.find({
      where: {
        userId,
      },
      order: {
        id: 'ASC',
      },
    });

    if (students.length === 0) {
      throw new NotFoundException('Aluno vinculado ao usuario nao encontrado');
    }

    return students;
  }
}
