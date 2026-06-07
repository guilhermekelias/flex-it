import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { NutritionPlan } from './entities/nutrition-plan.entity';

export type CreateNutritionPlanData = {
  name?: unknown;
  objective?: unknown;
  calories?: unknown;
  proteinGrams?: unknown;
  carbsGrams?: unknown;
  fatGrams?: unknown;
  mealsCount?: unknown;
  notes?: unknown;
};

export type UpdateNutritionPlanData = Partial<CreateNutritionPlanData>;

type NormalizedNutritionPlanData = Partial<
  Pick<
    NutritionPlan,
    | 'name'
    | 'objective'
    | 'calories'
    | 'proteinGrams'
    | 'carbsGrams'
    | 'fatGrams'
    | 'mealsCount'
    | 'notes'
  >
>;

@Injectable()
export class NutritionPlansService {
  constructor(
    @InjectRepository(NutritionPlan)
    private readonly nutritionPlansRepository: Repository<NutritionPlan>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async createForStudent(
    studentId: number,
    professionalId: number,
    data: CreateNutritionPlanData,
  ): Promise<NutritionPlan> {
    const nutritionPlanData = this.normalizeNutritionPlanData(data, true);
    await this.findProfessionalStudentOrFail(studentId, professionalId);

    const nutritionPlan = this.nutritionPlansRepository.create({
      ...nutritionPlanData,
      studentId,
      professionalId,
    });

    return this.nutritionPlansRepository.save(nutritionPlan);
  }

  async findAllForProfessional(professionalId: number): Promise<NutritionPlan[]> {
    return this.nutritionPlansRepository.find({
      where: {
        professionalId,
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findByStudentForProfessional(
    studentId: number,
    professionalId: number,
  ): Promise<NutritionPlan[]> {
    await this.findProfessionalStudentOrFail(studentId, professionalId);

    return this.nutritionPlansRepository.find({
      where: {
        studentId,
        professionalId,
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async updateForStudent(
    studentId: number,
    nutritionPlanId: number,
    professionalId: number,
    data: UpdateNutritionPlanData,
  ): Promise<NutritionPlan> {
    const nutritionPlanData = this.normalizeNutritionPlanData(data, false);
    const nutritionPlan = await this.nutritionPlansRepository.findOne({
      where: {
        id: nutritionPlanId,
        studentId,
        professionalId,
      },
    });

    if (!nutritionPlan) {
      throw new NotFoundException('Plano alimentar nao encontrado');
    }

    Object.assign(nutritionPlan, nutritionPlanData);

    return this.nutritionPlansRepository.save(nutritionPlan);
  }

  async removeForStudent(
    studentId: number,
    nutritionPlanId: number,
    professionalId: number,
  ): Promise<void> {
    const result = await this.nutritionPlansRepository.delete({
      id: nutritionPlanId,
      studentId,
      professionalId,
    });

    if (!result.affected) {
      throw new NotFoundException('Plano alimentar nao encontrado');
    }
  }

  async findForStudentUser(email: string): Promise<NutritionPlan[]> {
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

    return this.nutritionPlansRepository.find({
      where: {
        studentId: students[0].id,
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  private normalizeNutritionPlanData(
    data: CreateNutritionPlanData | UpdateNutritionPlanData,
    requireAllFields: boolean,
  ): NormalizedNutritionPlanData {
    const payload = this.getPayloadObject(data);
    const nutritionPlanData: NormalizedNutritionPlanData = {
      ...this.normalizeName(payload.name, requireAllFields),
      ...this.normalizeObjective(payload.objective, requireAllFields),
      ...this.normalizeCalories(payload.calories, requireAllFields),
      ...this.normalizeProteinGrams(payload.proteinGrams, requireAllFields),
      ...this.normalizeCarbsGrams(payload.carbsGrams, requireAllFields),
      ...this.normalizeFatGrams(payload.fatGrams, requireAllFields),
      ...this.normalizeMealsCount(payload.mealsCount, requireAllFields),
      ...this.normalizeNotes(payload.notes),
    };

    if (Object.keys(nutritionPlanData).length === 0) {
      throw new BadRequestException('Informe ao menos um campo do plano alimentar');
    }

    return nutritionPlanData;
  }

  private getPayloadObject(
    data: CreateNutritionPlanData | UpdateNutritionPlanData,
  ): Record<string, unknown> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Payload de plano alimentar invalido');
    }

    return data as Record<string, unknown>;
  }

  private normalizeName(
    name: unknown,
    required: boolean,
  ): Pick<NormalizedNutritionPlanData, 'name'> {
    if (name === undefined) {
      if (required) {
        throw new BadRequestException('Nome do plano alimentar e obrigatorio');
      }

      return {};
    }

    return {
      name: this.normalizeRequiredText(name, 'Nome do plano alimentar e obrigatorio'),
    };
  }

  private normalizeObjective(
    objective: unknown,
    required: boolean,
  ): Pick<NormalizedNutritionPlanData, 'objective'> {
    if (objective === undefined) {
      if (required) {
        throw new BadRequestException('Objetivo do plano alimentar e obrigatorio');
      }

      return {};
    }

    return {
      objective: this.normalizeRequiredText(
        objective,
        'Objetivo do plano alimentar e obrigatorio',
      ),
    };
  }

  private normalizeCalories(
    calories: unknown,
    required: boolean,
  ): Pick<NormalizedNutritionPlanData, 'calories'> {
    return this.normalizeInteger(calories, 'calories', required, 1);
  }

  private normalizeProteinGrams(
    proteinGrams: unknown,
    required: boolean,
  ): Pick<NormalizedNutritionPlanData, 'proteinGrams'> {
    return this.normalizeInteger(proteinGrams, 'proteinGrams', required, 0);
  }

  private normalizeCarbsGrams(
    carbsGrams: unknown,
    required: boolean,
  ): Pick<NormalizedNutritionPlanData, 'carbsGrams'> {
    return this.normalizeInteger(carbsGrams, 'carbsGrams', required, 0);
  }

  private normalizeFatGrams(
    fatGrams: unknown,
    required: boolean,
  ): Pick<NormalizedNutritionPlanData, 'fatGrams'> {
    return this.normalizeInteger(fatGrams, 'fatGrams', required, 0);
  }

  private normalizeMealsCount(
    mealsCount: unknown,
    required: boolean,
  ): Pick<NormalizedNutritionPlanData, 'mealsCount'> {
    return this.normalizeInteger(mealsCount, 'mealsCount', required, 1);
  }

  private normalizeNotes(notes: unknown): Pick<NormalizedNutritionPlanData, 'notes'> {
    if (notes === undefined) {
      return {};
    }

    if (notes === null) {
      return { notes: null };
    }

    if (typeof notes !== 'string') {
      throw new BadRequestException('Observacoes do plano alimentar invalidas');
    }

    return { notes: notes.trim() || null };
  }

  private normalizeRequiredText(value: unknown, errorMessage: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(errorMessage);
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(errorMessage);
    }

    return normalizedValue;
  }

  private normalizeInteger<K extends keyof NormalizedNutritionPlanData>(
    value: unknown,
    field: K,
    required: boolean,
    minimum: number,
  ): Pick<NormalizedNutritionPlanData, K> {
    if (value === undefined) {
      if (required) {
        throw new BadRequestException(this.getIntegerErrorMessage(field));
      }

      return {} as Pick<NormalizedNutritionPlanData, K>;
    }

    if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum) {
      throw new BadRequestException(this.getIntegerErrorMessage(field));
    }

    return { [field]: value } as Pick<NormalizedNutritionPlanData, K>;
  }

  private getIntegerErrorMessage(field: keyof NormalizedNutritionPlanData): string {
    const messages: Record<keyof NormalizedNutritionPlanData, string> = {
      name: 'Nome do plano alimentar e obrigatorio',
      objective: 'Objetivo do plano alimentar e obrigatorio',
      calories: 'Calorias devem ser um numero inteiro maior que zero',
      proteinGrams: 'Proteinas devem ser um numero inteiro maior ou igual a zero',
      carbsGrams: 'Carboidratos devem ser um numero inteiro maior ou igual a zero',
      fatGrams: 'Gorduras devem ser um numero inteiro maior ou igual a zero',
      mealsCount: 'Quantidade de refeicoes deve ser um numero inteiro maior que zero',
      notes: 'Observacoes do plano alimentar invalidas',
    };

    return messages[field];
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
