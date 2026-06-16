import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Workout } from './entities/workout.entity';

export type CreateWorkoutData = {
  name?: string;
  description?: string | null;
  type?: string;
  durationMinutes?: number;
  exercisesCount?: number;
};

export type UpdateWorkoutData = Partial<CreateWorkoutData>;

type NormalizedWorkoutData = {
  name?: string;
  description?: string | null;
  type?: string;
  durationMinutes?: number;
  exercisesCount?: number;
};

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Workout)
    private readonly workoutsRepository: Repository<Workout>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async createForStudent(
    studentId: number,
    professionalId: number,
    data: CreateWorkoutData,
  ): Promise<Workout> {
    const workoutData = this.normalizeWorkoutData(data, true);
    await this.findProfessionalStudentOrFail(studentId, professionalId);

    const workout = this.workoutsRepository.create({
      ...workoutData,
      studentId,
      professionalId,
    });

    return this.workoutsRepository.save(workout);
  }

  async findAllForProfessional(professionalId: number): Promise<Workout[]> {
    return this.workoutsRepository.find({
      where: {
        professionalId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByStudentForProfessional(
    studentId: number,
    professionalId: number,
  ): Promise<Workout[]> {
    await this.findProfessionalStudentOrFail(studentId, professionalId);

    return this.workoutsRepository.find({
      where: {
        studentId,
        professionalId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateForStudent(
    studentId: number,
    workoutId: number,
    professionalId: number,
    data: UpdateWorkoutData,
  ): Promise<Workout> {
    const workout = await this.workoutsRepository.findOne({
      where: {
        id: workoutId,
        studentId,
        professionalId,
      },
    });

    if (!workout) {
      throw new NotFoundException('Treino nao encontrado');
    }

    Object.assign(workout, this.normalizeWorkoutData(data, false));

    return this.workoutsRepository.save(workout);
  }

  async removeForStudent(
    studentId: number,
    workoutId: number,
    professionalId: number,
  ): Promise<void> {
    const result = await this.workoutsRepository.delete({
      id: workoutId,
      studentId,
      professionalId,
    });

    if (!result.affected) {
      throw new NotFoundException('Treino nao encontrado');
    }
  }

  async findForStudentUser(userId: number): Promise<Workout[]> {
    const students = await this.studentsRepository.find({
      where: {
        userId,
      },
    });

    if (students.length === 0) {
      throw new NotFoundException('Aluno vinculado ao usuario nao encontrado');
    }

    const studentIds = students.map((student) => student.id);

    return this.workoutsRepository.find({
      where: {
        studentId: In(studentIds),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  private normalizeWorkoutData(
    data: CreateWorkoutData | UpdateWorkoutData,
    requireAllFields: boolean,
  ): NormalizedWorkoutData {
    return {
      ...this.normalizeName(data.name, requireAllFields),
      ...this.normalizeDescription(data.description),
      ...this.normalizeType(data.type, requireAllFields),
      ...this.normalizeDurationMinutes(data.durationMinutes, requireAllFields),
      ...this.normalizeExercisesCount(data.exercisesCount, requireAllFields),
    };
  }

  private normalizeName(
    name: CreateWorkoutData['name'],
    required: boolean,
  ): Pick<NormalizedWorkoutData, 'name'> {
    if (name === undefined) {
      if (required) {
        throw new BadRequestException('Nome do treino e obrigatorio');
      }

      return {};
    }

    const normalizedName = this.normalizeRequiredText(name, 'Nome do treino e obrigatorio');
    return { name: normalizedName };
  }

  private normalizeDescription(
    description: CreateWorkoutData['description'],
  ): Pick<NormalizedWorkoutData, 'description'> {
    if (description === undefined) {
      return {};
    }

    if (description === null) {
      return { description: null };
    }

    if (typeof description !== 'string') {
      throw new BadRequestException('Descricao do treino invalida');
    }

    return { description: description.trim() || null };
  }

  private normalizeType(
    type: CreateWorkoutData['type'],
    required: boolean,
  ): Pick<NormalizedWorkoutData, 'type'> {
    if (type === undefined) {
      if (required) {
        throw new BadRequestException('Tipo do treino e obrigatorio');
      }

      return {};
    }

    const normalizedType = this.normalizeRequiredText(type, 'Tipo do treino e obrigatorio');
    return { type: normalizedType };
  }

  private normalizeDurationMinutes(
    durationMinutes: CreateWorkoutData['durationMinutes'],
    required: boolean,
  ): Pick<NormalizedWorkoutData, 'durationMinutes'> {
    if (durationMinutes === undefined) {
      if (required) {
        throw new BadRequestException('Duracao do treino e obrigatoria');
      }

      return {};
    }

    return {
      durationMinutes: this.normalizeInteger(
        durationMinutes,
        'Duracao do treino deve ser um numero inteiro positivo',
        1,
      ),
    };
  }

  private normalizeExercisesCount(
    exercisesCount: CreateWorkoutData['exercisesCount'],
    required: boolean,
  ): Pick<NormalizedWorkoutData, 'exercisesCount'> {
    if (exercisesCount === undefined) {
      if (required) {
        throw new BadRequestException('Quantidade de exercicios e obrigatoria');
      }

      return {};
    }

    return {
      exercisesCount: this.normalizeInteger(
        exercisesCount,
        'Quantidade de exercicios deve ser um numero inteiro maior ou igual a zero',
        0,
      ),
    };
  }

  private normalizeRequiredText(value: string, errorMessage: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(errorMessage);
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(errorMessage);
    }

    return normalizedValue;
  }

  private normalizeInteger(value: number, errorMessage: string, minimum: number): number {
    if (!Number.isInteger(value) || value < minimum) {
      throw new BadRequestException(errorMessage);
    }

    return value;
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
