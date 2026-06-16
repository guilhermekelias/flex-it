import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import {
  CreateNutritionPlanData,
  NutritionPlansService,
  UpdateNutritionPlanData,
} from './nutrition-plans.service';

type MockNutritionPlansRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  delete: jest.Mock;
};

type MockStudentsRepository = {
  find: jest.Mock;
  findOne: jest.Mock;
};

describe('NutritionPlansService', () => {
  let service: NutritionPlansService;
  let nutritionPlansRepository: MockNutritionPlansRepository;
  let studentsRepository: MockStudentsRepository;

  beforeEach(async () => {
    nutritionPlansRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    studentsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionPlansService,
        {
          provide: getRepositoryToken(NutritionPlan),
          useValue: nutritionPlansRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: studentsRepository,
        },
      ],
    }).compile();

    service = module.get<NutritionPlansService>(NutritionPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a nutrition plan for a student owned by the professional', async () => {
    const student = { id: 3, professionalId: 10 } as Student;
    const data = {
      name: '  Plano inicial  ',
      objective: '  Hipertrofia  ',
      calories: 2500,
      proteinGrams: 150,
      carbsGrams: 300,
      fatGrams: 70,
      mealsCount: 5,
      notes: '  Ajustar semanalmente  ',
      studentId: 99,
      professionalId: 99,
    } as CreateNutritionPlanData & { studentId: number; professionalId: number };
    const nutritionPlan = {
      id: 1,
      name: 'Plano inicial',
      objective: 'Hipertrofia',
      calories: 2500,
      proteinGrams: 150,
      carbsGrams: 300,
      fatGrams: 70,
      mealsCount: 5,
      notes: 'Ajustar semanalmente',
      studentId: 3,
      professionalId: 10,
    } as NutritionPlan;

    studentsRepository.findOne.mockResolvedValue(student);
    nutritionPlansRepository.create.mockReturnValue(nutritionPlan);
    nutritionPlansRepository.save.mockResolvedValue(nutritionPlan);

    await expect(service.createForStudent(3, 10, data)).resolves.toEqual(nutritionPlan);
    expect(studentsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 3,
        professionalId: 10,
      },
    });
    expect(nutritionPlansRepository.create).toHaveBeenCalledWith({
      name: 'Plano inicial',
      objective: 'Hipertrofia',
      calories: 2500,
      proteinGrams: 150,
      carbsGrams: 300,
      fatGrams: 70,
      mealsCount: 5,
      notes: 'Ajustar semanalmente',
      studentId: 3,
      professionalId: 10,
    });
    expect(nutritionPlansRepository.save).toHaveBeenCalledWith(nutritionPlan);
  });

  it('should reject invalid nutrition plan payloads before checking ownership', async () => {
    await expect(
      service.createForStudent(3, 10, {
        name: 'Plano inicial',
        objective: 'Hipertrofia',
        calories: 0,
        proteinGrams: 150,
        carbsGrams: 300,
        fatGrams: 70,
        mealsCount: 5,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(studentsRepository.findOne).not.toHaveBeenCalled();
    expect(nutritionPlansRepository.save).not.toHaveBeenCalled();
  });

  it('should reject creation when the student does not belong to the professional', async () => {
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createForStudent(3, 10, {
        name: 'Plano inicial',
        objective: 'Hipertrofia',
        calories: 2500,
        proteinGrams: 150,
        carbsGrams: 300,
        fatGrams: 70,
        mealsCount: 5,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(nutritionPlansRepository.save).not.toHaveBeenCalled();
  });

  it('should return only nutrition plans from the authenticated professional', async () => {
    const nutritionPlans = [
      {
        id: 1,
        name: 'Plano inicial',
        studentId: 3,
        professionalId: 10,
      },
    ] as NutritionPlan[];

    nutritionPlansRepository.find.mockResolvedValue(nutritionPlans);

    await expect(service.findAllForProfessional(10)).resolves.toEqual(nutritionPlans);
    expect(nutritionPlansRepository.find).toHaveBeenCalledWith({
      where: {
        professionalId: 10,
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  });

  it('should list nutrition plans only after confirming professional ownership of the student', async () => {
    const student = { id: 3, professionalId: 10 } as Student;
    const nutritionPlans = [
      {
        id: 1,
        name: 'Plano inicial',
        studentId: 3,
        professionalId: 10,
      },
    ] as NutritionPlan[];

    studentsRepository.findOne.mockResolvedValue(student);
    nutritionPlansRepository.find.mockResolvedValue(nutritionPlans);

    await expect(service.findByStudentForProfessional(3, 10)).resolves.toEqual(nutritionPlans);
    expect(nutritionPlansRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: 3,
        professionalId: 10,
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  });

  it('should reject listing when the student does not belong to the professional', async () => {
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(service.findByStudentForProfessional(3, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(nutritionPlansRepository.find).not.toHaveBeenCalled();
  });

  it('should update a nutrition plan only when it belongs to the student and professional', async () => {
    const existingNutritionPlan = {
      id: 1,
      name: 'Plano inicial',
      objective: 'Hipertrofia',
      calories: 2500,
      proteinGrams: 150,
      carbsGrams: 300,
      fatGrams: 70,
      mealsCount: 5,
      notes: null,
      studentId: 3,
      professionalId: 10,
    } as NutritionPlan;
    const data = {
      name: '  Plano ajustado  ',
      calories: 2600,
      notes: '  Aumentar calorias  ',
      studentId: 99,
      professionalId: 99,
    } as UpdateNutritionPlanData & { studentId: number; professionalId: number };
    const updatedNutritionPlan = {
      ...existingNutritionPlan,
      name: 'Plano ajustado',
      calories: 2600,
      notes: 'Aumentar calorias',
    } as NutritionPlan;

    nutritionPlansRepository.findOne.mockResolvedValue(existingNutritionPlan);
    nutritionPlansRepository.save.mockResolvedValue(updatedNutritionPlan);

    await expect(service.updateForStudent(3, 1, 10, data)).resolves.toEqual(
      updatedNutritionPlan,
    );
    expect(nutritionPlansRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        studentId: 3,
        professionalId: 10,
      },
    });
    expect(nutritionPlansRepository.save).toHaveBeenCalledWith({
      ...existingNutritionPlan,
      name: 'Plano ajustado',
      calories: 2600,
      notes: 'Aumentar calorias',
    });
  });

  it('should reject update payloads without supported nutrition plan fields', async () => {
    await expect(
      service.updateForStudent(3, 1, 10, {
        studentId: 99,
      } as UpdateNutritionPlanData & { studentId: number }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(nutritionPlansRepository.findOne).not.toHaveBeenCalled();
    expect(nutritionPlansRepository.save).not.toHaveBeenCalled();
  });

  it('should reject update when the nutrition plan does not belong to the student and professional', async () => {
    nutritionPlansRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateForStudent(3, 1, 10, {
        name: 'Plano inexistente',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(nutritionPlansRepository.save).not.toHaveBeenCalled();
  });

  it('should remove a nutrition plan only when it belongs to the student and professional', async () => {
    nutritionPlansRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.removeForStudent(3, 1, 10)).resolves.toBeUndefined();
    expect(nutritionPlansRepository.delete).toHaveBeenCalledWith({
      id: 1,
      studentId: 3,
      professionalId: 10,
    });
  });

  it('should throw NotFoundException when remove target is not owned by the professional', async () => {
    nutritionPlansRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.removeForStudent(3, 1, 10)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should list nutrition plans linked to the authenticated student user', async () => {
    const students = [
      { id: 3, userId: 20 },
      { id: 4, userId: 20 },
    ] as Student[];
    const nutritionPlans = [
      {
        id: 1,
        name: 'Plano inicial',
        studentId: 3,
        professionalId: 10,
      },
    ] as NutritionPlan[];

    studentsRepository.find.mockResolvedValue(students);
    nutritionPlansRepository.find.mockResolvedValue(nutritionPlans);

    await expect(service.findForStudentUser(20)).resolves.toEqual(nutritionPlans);
    expect(studentsRepository.find).toHaveBeenCalledWith({
      where: {
        userId: 20,
      },
    });
    expect(nutritionPlansRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: expect.any(Object),
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  });

  it('should throw NotFoundException when the authenticated student has no student record', async () => {
    studentsRepository.find.mockResolvedValue([]);

    await expect(service.findForStudentUser(20)).rejects.toBeInstanceOf(NotFoundException);
    expect(nutritionPlansRepository.find).not.toHaveBeenCalled();
  });
});
