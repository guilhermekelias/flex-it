import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import {
  normalizeEmailField,
  normalizeRequiredText,
} from '../common/validation/text-normalizers';
import { User, UserRole } from '../users/entities/user.entity';
import { Student } from './entities/student.entity';

type StudentData = Partial<Pick<Student, 'name' | 'email' | 'age' | 'goal'>>;
type NormalizedStudentData = StudentData & Pick<Student, 'userId'>;

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: StudentData, professionalId: number): Promise<Student> {
    const studentData = await this.normalizeStudentData(data, true);
    const student = this.studentsRepository.create({
      ...studentData,
      professionalId,
    });

    return this.studentsRepository.save(student);
  }

  async findAll(professionalId: number): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { professionalId },
    });
  }

  async update(id: number, data: StudentData, professionalId: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: {
        id,
        professionalId,
      },
    });

    if (!student) {
      throw new NotFoundException('Aluno nao encontrado');
    }

    Object.assign(student, await this.normalizeStudentData(data, false));

    return this.studentsRepository.save(student);
  }

  async remove(id: number, professionalId: number): Promise<void> {
    const result = await this.studentsRepository.delete({
      id,
      professionalId,
    });

    if (!result.affected) {
      throw new NotFoundException('Aluno nao encontrado');
    }
  }

  private async normalizeStudentData(
    data: StudentData,
    requireAllFields: boolean,
  ): Promise<Partial<NormalizedStudentData>> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Dados do aluno invalidos');
    }

    const studentData: Partial<NormalizedStudentData> = {};

    if (data.name !== undefined || requireAllFields) {
      studentData.name = normalizeRequiredText(data.name, 'Nome do aluno e obrigatorio');
    }

    if (data.email !== undefined || requireAllFields) {
      const email = normalizeEmailField(
        data.email,
        'E-mail do aluno e obrigatorio',
        'E-mail do aluno invalido',
      );
      studentData.email = email;
      studentData.userId = await this.resolveStudentUserId(email);
    }

    if (data.age !== undefined || requireAllFields) {
      studentData.age = this.normalizeAge(data.age);
    }

    if (data.goal !== undefined || requireAllFields) {
      studentData.goal = normalizeRequiredText(data.goal, 'Objetivo do aluno e obrigatorio');
    }

    return studentData;
  }

  private normalizeAge(value: unknown): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
      throw new BadRequestException('Idade do aluno deve ser um numero inteiro positivo');
    }

    return value;
  }

  private async resolveStudentUserId(email: string): Promise<number | null> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        email: Raw((alias) => `LOWER(TRIM(${alias})) = :email`, {
          email,
        }),
      },
    });

    if (!existingUser) {
      return null;
    }

    if (existingUser.role === UserRole.PROFESSIONAL) {
      throw new BadRequestException('E-mail informado pertence a um usuario profissional');
    }

    return existingUser.id;
  }
}
