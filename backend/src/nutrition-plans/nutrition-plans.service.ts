import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  normalizeOptionalShortText,
  normalizeRequiredText,
} from '../common/validation/text-normalizers';
import { findProfessionalStudentOrFail } from '../common/students/find-professional-student';
import { Student } from '../students/entities/student.entity';
import {
  NutritionPlan,
  NutritionPlanFood,
  NutritionPlanMeal,
} from './entities/nutrition-plan.entity';

export type NutritionPlanFoodData = {
  name?: unknown;
  quantity?: unknown;
  calories?: unknown;
};

export type NutritionPlanMealData = {
  name?: unknown;
  time?: unknown;
  foods?: unknown;
};

export type CreateNutritionPlanData = {
  name?: unknown;
  objective?: unknown;
  calories?: unknown;
  proteinGrams?: unknown;
  carbsGrams?: unknown;
  fatGrams?: unknown;
  mealsCount?: unknown;
  meals?: unknown;
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
    | 'meals'
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
    await findProfessionalStudentOrFail(this.studentsRepository, studentId, professionalId);

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
    await findProfessionalStudentOrFail(this.studentsRepository, studentId, professionalId);

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

  async findForStudentUser(userId: number): Promise<NutritionPlan[]> {
    const students = await this.studentsRepository.find({
      where: {
        userId,
      },
    });

    if (students.length === 0) {
      throw new NotFoundException('Aluno vinculado ao usuario nao encontrado');
    }

    const studentIds = students.map((student) => student.id);

    return this.nutritionPlansRepository.find({
      where: {
        studentId: In(studentIds),
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
    const hasMeals = Object.prototype.hasOwnProperty.call(payload, 'meals');
    const nutritionPlanData: NormalizedNutritionPlanData = {
      ...this.normalizeName(payload.name, requireAllFields),
      ...this.normalizeObjective(payload.objective, requireAllFields),
      ...this.normalizeCalories(payload.calories, requireAllFields),
      ...this.normalizeProteinGrams(payload.proteinGrams, requireAllFields),
      ...this.normalizeCarbsGrams(payload.carbsGrams, requireAllFields),
      ...this.normalizeFatGrams(payload.fatGrams, requireAllFields),
      ...(hasMeals
        ? this.normalizeMeals(payload.meals)
        : this.normalizeMealsCount(payload.mealsCount, requireAllFields)),
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
      name: normalizeRequiredText(name, 'Nome do plano alimentar e obrigatorio'),
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
      objective: normalizeRequiredText(
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

  private normalizeMeals(
    meals: unknown,
  ): Pick<NormalizedNutritionPlanData, 'meals' | 'mealsCount'> {
    if (meals === undefined || meals === null) {
      return {
        meals: [],
        mealsCount: 0,
      };
    }

    if (!Array.isArray(meals)) {
      throw new BadRequestException('Lista de refeicoes invalida');
    }

    const normalizedMeals = meals
      .map((meal, index) => this.normalizeMeal(meal, index))
      .filter((meal): meal is NutritionPlanMeal => meal !== null);

    return {
      meals: normalizedMeals,
      mealsCount: normalizedMeals.length,
    };
  }

  private normalizeMeal(meal: unknown, index: number): NutritionPlanMeal | null {
    if (!meal || typeof meal !== 'object' || Array.isArray(meal)) {
      throw new BadRequestException(`Refeicao ${index + 1} invalida`);
    }

    const mealData = meal as NutritionPlanMealData;
    const time = normalizeOptionalShortText(
      mealData.time,
      `Horario da refeicao ${index + 1} deve ser um texto curto`,
      40,
    );
    const foods = this.normalizeFoods(mealData.foods, index);
    const name = this.normalizeMealName(mealData.name, index, foods.length > 0);

    if (foods.length === 0) {
      return null;
    }

    return {
      name,
      time,
      foods,
    };
  }

  private normalizeMealName(name: unknown, index: number, required: boolean): string {
    if (name === undefined || name === null || name === '') {
      if (!required) {
        return '';
      }

      throw new BadRequestException(`Nome da refeicao ${index + 1} e obrigatorio`);
    }

    if (typeof name !== 'string') {
      throw new BadRequestException(`Nome da refeicao ${index + 1} e obrigatorio`);
    }

    const normalizedName = name.trim();

    if (!normalizedName) {
      if (!required) {
        return '';
      }

      throw new BadRequestException(`Nome da refeicao ${index + 1} e obrigatorio`);
    }

    if (normalizedName.length > 100) {
      throw new BadRequestException(`Nome da refeicao ${index + 1} deve ter ate 100 caracteres`);
    }

    return normalizedName;
  }

  private normalizeFoods(foods: unknown, mealIndex: number): NutritionPlanFood[] {
    if (foods === undefined || foods === null) {
      return [];
    }

    if (!Array.isArray(foods)) {
      throw new BadRequestException(`Alimentos da refeicao ${mealIndex + 1} invalidos`);
    }

    return foods
      .map((food, index) => this.normalizeFood(food, mealIndex, index))
      .filter((food): food is NutritionPlanFood => food !== null);
  }

  private normalizeFood(
    food: unknown,
    mealIndex: number,
    index: number,
  ): NutritionPlanFood | null {
    if (!food || typeof food !== 'object' || Array.isArray(food)) {
      throw new BadRequestException(
        `Alimento ${index + 1} da refeicao ${mealIndex + 1} invalido`,
      );
    }

    const foodData = food as NutritionPlanFoodData;
    const quantity = normalizeOptionalShortText(
      foodData.quantity,
      `Quantidade do alimento ${index + 1} da refeicao ${mealIndex + 1} deve ser um texto curto`,
      40,
    );
    const calories = this.normalizeFoodCalories(foodData.calories, mealIndex, index);
    const hasAnyValue = Boolean(
      quantity !== null || calories !== null || this.hasTextValue(foodData.name),
    );

    if (!hasAnyValue) {
      return null;
    }

    return {
      name: this.normalizeFoodName(foodData.name, mealIndex, index),
      quantity,
      calories,
    };
  }

  private normalizeFoodName(name: unknown, mealIndex: number, index: number): string {
    const errorMessage = `Nome do alimento ${index + 1} da refeicao ${mealIndex + 1} e obrigatorio`;

    if (typeof name !== 'string') {
      throw new BadRequestException(errorMessage);
    }

    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new BadRequestException(errorMessage);
    }

    if (normalizedName.length > 120) {
      throw new BadRequestException(
        `Nome do alimento ${index + 1} da refeicao ${mealIndex + 1} deve ter ate 120 caracteres`,
      );
    }

    return normalizedName;
  }

  private normalizeFoodCalories(
    calories: unknown,
    mealIndex: number,
    index: number,
  ): number | null {
    if (calories === undefined || calories === null || calories === '') {
      return null;
    }

    if (typeof calories !== 'number' || !Number.isFinite(calories) || calories <= 0) {
      throw new BadRequestException(
        `Calorias do alimento ${index + 1} da refeicao ${mealIndex + 1} devem ser um numero positivo`,
      );
    }

    return calories;
  }

  private hasTextValue(value: unknown): boolean {
    return typeof value === 'string' && Boolean(value.trim());
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
      meals: 'Lista de refeicoes invalida',
      notes: 'Observacoes do plano alimentar invalidas',
    };

    return messages[field];
  }

}
