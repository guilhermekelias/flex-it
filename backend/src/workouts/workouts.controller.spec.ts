import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../users/entities/user.entity';
import { Workout } from './entities/workout.entity';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';

type MockWorkoutsService = {
  createForStudent: jest.Mock;
  findAllForProfessional: jest.Mock;
  findByStudentForProfessional: jest.Mock;
  updateForStudent: jest.Mock;
  removeForStudent: jest.Mock;
  findForStudentUser: jest.Mock;
};

type ProfessionalRequest = Parameters<WorkoutsController['findAllForProfessional']>[0];
type StudentRequest = Parameters<WorkoutsController['findForCurrentStudent']>[0];

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

describe('WorkoutsController', () => {
  let controller: WorkoutsController;
  let workoutsService: MockWorkoutsService;

  beforeEach(async () => {
    workoutsService = {
      createForStudent: jest.fn(),
      findAllForProfessional: jest.fn(),
      findByStudentForProfessional: jest.fn(),
      updateForStudent: jest.fn(),
      removeForStudent: jest.fn(),
      findForStudentUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutsController],
      providers: [
        {
          provide: WorkoutsService,
          useValue: workoutsService,
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WorkoutsController>(WorkoutsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should allow professional users to list their workouts', async () => {
    const workouts = [
      {
        id: 1,
        name: 'Treino A',
        studentId: 3,
        professionalId: 10,
      },
    ] as Workout[];

    workoutsService.findAllForProfessional.mockResolvedValue(workouts);

    await expect(controller.findAllForProfessional(professionalRequest)).resolves.toEqual(
      workouts,
    );
    expect(workoutsService.findAllForProfessional).toHaveBeenCalledWith(10);
  });

  it('should allow professional users to create workouts for a student', async () => {
    const body = {
      name: 'Treino A',
      description: 'Base semanal',
      type: 'Hipertrofia',
      durationMinutes: 60,
      exercisesCount: 8,
    };
    const workout = {
      id: 1,
      ...body,
      studentId: 3,
      professionalId: 10,
    } as Workout;

    workoutsService.createForStudent.mockResolvedValue(workout);

    await expect(controller.createForStudent(3, body, professionalRequest)).resolves.toEqual(
      workout,
    );
    expect(workoutsService.createForStudent).toHaveBeenCalledWith(3, 10, body);
  });

  it('should allow professional users to list workouts from a student', async () => {
    const workouts = [
      {
        id: 1,
        name: 'Treino A',
        studentId: 3,
        professionalId: 10,
      },
    ] as Workout[];

    workoutsService.findByStudentForProfessional.mockResolvedValue(workouts);

    await expect(
      controller.findByStudentForProfessional(3, professionalRequest),
    ).resolves.toEqual(workouts);
    expect(workoutsService.findByStudentForProfessional).toHaveBeenCalledWith(3, 10);
  });

  it('should allow professional users to update workouts from a student', async () => {
    const body = {
      name: 'Treino B',
    };
    const workout = {
      id: 1,
      name: 'Treino B',
      studentId: 3,
      professionalId: 10,
    } as Workout;

    workoutsService.updateForStudent.mockResolvedValue(workout);

    await expect(controller.updateForStudent(3, 1, body, professionalRequest)).resolves.toEqual(
      workout,
    );
    expect(workoutsService.updateForStudent).toHaveBeenCalledWith(3, 1, 10, body);
  });

  it('should allow professional users to remove workouts from a student', async () => {
    workoutsService.removeForStudent.mockResolvedValue(undefined);

    await expect(controller.removeForStudent(3, 1, professionalRequest)).resolves.toBeUndefined();
    expect(workoutsService.removeForStudent).toHaveBeenCalledWith(3, 1, 10);
  });

  it('should reject student users from professional workout routes', () => {
    expect(() =>
      controller.findByStudentForProfessional(3, studentRequest as ProfessionalRequest),
    ).toThrow(ForbiddenException);
    expect(workoutsService.findByStudentForProfessional).not.toHaveBeenCalled();
  });

  it('should allow student users to list their own workouts', async () => {
    const workouts = [
      {
        id: 1,
        name: 'Treino A',
        studentId: 3,
        professionalId: 10,
      },
    ] as Workout[];

    workoutsService.findForStudentUser.mockResolvedValue(workouts);

    await expect(controller.findForCurrentStudent(studentRequest)).resolves.toEqual(workouts);
    expect(workoutsService.findForStudentUser).toHaveBeenCalledWith('ana@example.com');
  });

  it('should reject professional users from the student workout route', () => {
    expect(() =>
      controller.findForCurrentStudent(professionalRequest as StudentRequest),
    ).toThrow(ForbiddenException);
    expect(workoutsService.findForStudentUser).not.toHaveBeenCalled();
  });
});
