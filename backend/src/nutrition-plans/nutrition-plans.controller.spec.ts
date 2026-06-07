import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../users/entities/user.entity';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import { NutritionPlansController } from './nutrition-plans.controller';
import { NutritionPlansService } from './nutrition-plans.service';

type MockNutritionPlansService = {
  createForStudent: jest.Mock;
  findAllForProfessional: jest.Mock;
  findByStudentForProfessional: jest.Mock;
  updateForStudent: jest.Mock;
  removeForStudent: jest.Mock;
  findForStudentUser: jest.Mock;
};

type ProfessionalRequest = Parameters<NutritionPlansController['findAllForProfessional']>[0];
type StudentRequest = Parameters<NutritionPlansController['findForCurrentStudent']>[0];

const professionalRequest = {
  user: {
    sub: 10,
    email: 'profissional@example.com',
    role: UserRole.PROFESSIONAL,
  },
} as ProfessionalRequest;

const studentRequest = {
  user: {
    sub: 20,
    email: 'ana@example.com',
    role: UserRole.STUDENT,
  },
} as StudentRequest;

describe('NutritionPlansController', () => {
  let controller: NutritionPlansController;
  let nutritionPlansService: MockNutritionPlansService;

  beforeEach(async () => {
    nutritionPlansService = {
      createForStudent: jest.fn(),
      findAllForProfessional: jest.fn(),
      findByStudentForProfessional: jest.fn(),
      updateForStudent: jest.fn(),
      removeForStudent: jest.fn(),
      findForStudentUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NutritionPlansController],
      providers: [
        {
          provide: NutritionPlansService,
          useValue: nutritionPlansService,
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NutritionPlansController>(NutritionPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should allow professional users to list their nutrition plans', async () => {
    const nutritionPlans = [
      {
        id: 1,
        name: 'Plano inicial',
        studentId: 3,
        professionalId: 10,
      },
    ] as NutritionPlan[];

    nutritionPlansService.findAllForProfessional.mockResolvedValue(nutritionPlans);

    await expect(controller.findAllForProfessional(professionalRequest)).resolves.toEqual(
      nutritionPlans,
    );
    expect(nutritionPlansService.findAllForProfessional).toHaveBeenCalledWith(10);
  });

  it('should allow professional users to create nutrition plans for a student', async () => {
    const body = {
      name: 'Plano inicial',
      objective: 'Hipertrofia',
      calories: 2500,
      proteinGrams: 150,
      carbsGrams: 300,
      fatGrams: 70,
      mealsCount: 5,
      notes: 'Ajustar semanalmente',
    };
    const nutritionPlan = {
      id: 1,
      ...body,
      studentId: 3,
      professionalId: 10,
    } as NutritionPlan;

    nutritionPlansService.createForStudent.mockResolvedValue(nutritionPlan);

    await expect(controller.createForStudent(3, body, professionalRequest)).resolves.toEqual(
      nutritionPlan,
    );
    expect(nutritionPlansService.createForStudent).toHaveBeenCalledWith(3, 10, body);
  });

  it('should allow professional users to list nutrition plans from a student', async () => {
    const nutritionPlans = [
      {
        id: 1,
        name: 'Plano inicial',
        studentId: 3,
        professionalId: 10,
      },
    ] as NutritionPlan[];

    nutritionPlansService.findByStudentForProfessional.mockResolvedValue(nutritionPlans);

    await expect(
      controller.findByStudentForProfessional(3, professionalRequest),
    ).resolves.toEqual(nutritionPlans);
    expect(nutritionPlansService.findByStudentForProfessional).toHaveBeenCalledWith(3, 10);
  });

  it('should allow professional users to update nutrition plans from a student', async () => {
    const body = {
      name: 'Plano ajustado',
      calories: 2600,
    };
    const nutritionPlan = {
      id: 1,
      name: 'Plano ajustado',
      calories: 2600,
      studentId: 3,
      professionalId: 10,
    } as NutritionPlan;

    nutritionPlansService.updateForStudent.mockResolvedValue(nutritionPlan);

    await expect(controller.updateForStudent(3, 1, body, professionalRequest)).resolves.toEqual(
      nutritionPlan,
    );
    expect(nutritionPlansService.updateForStudent).toHaveBeenCalledWith(3, 1, 10, body);
  });

  it('should allow professional users to remove nutrition plans from a student', async () => {
    nutritionPlansService.removeForStudent.mockResolvedValue(undefined);

    await expect(controller.removeForStudent(3, 1, professionalRequest)).resolves.toBeUndefined();
    expect(nutritionPlansService.removeForStudent).toHaveBeenCalledWith(3, 1, 10);
  });

  it('should reject student users from professional nutrition plan routes', () => {
    expect(() =>
      controller.findByStudentForProfessional(3, studentRequest as ProfessionalRequest),
    ).toThrow(ForbiddenException);
    expect(nutritionPlansService.findByStudentForProfessional).not.toHaveBeenCalled();
  });

  it('should allow student users to list their own nutrition plans', async () => {
    const nutritionPlans = [
      {
        id: 1,
        name: 'Plano inicial',
        studentId: 3,
        professionalId: 10,
      },
    ] as NutritionPlan[];

    nutritionPlansService.findForStudentUser.mockResolvedValue(nutritionPlans);

    await expect(controller.findForCurrentStudent(studentRequest)).resolves.toEqual(
      nutritionPlans,
    );
    expect(nutritionPlansService.findForStudentUser).toHaveBeenCalledWith('ana@example.com');
  });

  it('should reject professional users from the student nutrition plan route', () => {
    expect(() =>
      controller.findForCurrentStudent(professionalRequest as StudentRequest),
    ).toThrow(ForbiddenException);
    expect(nutritionPlansService.findForStudentUser).not.toHaveBeenCalled();
  });
});
