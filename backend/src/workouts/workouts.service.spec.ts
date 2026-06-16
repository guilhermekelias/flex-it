import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { Workout } from './entities/workout.entity';
import {
  CreateWorkoutData,
  UpdateWorkoutData,
  WorkoutsService,
} from './workouts.service';

type MockWorkoutsRepository = {
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

describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let workoutsRepository: MockWorkoutsRepository;
  let studentsRepository: MockStudentsRepository;

  beforeEach(async () => {
    workoutsRepository = {
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
        WorkoutsService,
        {
          provide: getRepositoryToken(Workout),
          useValue: workoutsRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: studentsRepository,
        },
      ],
    }).compile();

    service = module.get<WorkoutsService>(WorkoutsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a workout for a student owned by the professional', async () => {
    const student = { id: 3, professionalId: 10 } as Student;
    const data = {
      name: '  Treino A  ',
      description: '  Base semanal  ',
      type: '  Hipertrofia  ',
      durationMinutes: 60,
      exercisesCount: 8,
      studentId: 99,
      professionalId: 99,
    } as CreateWorkoutData & { studentId: number; professionalId: number };
    const workout = {
      id: 1,
      name: 'Treino A',
      description: 'Base semanal',
      type: 'Hipertrofia',
      durationMinutes: 60,
      exercisesCount: 8,
      studentId: 3,
      professionalId: 10,
    } as Workout;

    studentsRepository.findOne.mockResolvedValue(student);
    workoutsRepository.create.mockReturnValue(workout);
    workoutsRepository.save.mockResolvedValue(workout);

    await expect(service.createForStudent(3, 10, data)).resolves.toEqual(workout);
    expect(studentsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 3,
        professionalId: 10,
      },
    });
    expect(workoutsRepository.create).toHaveBeenCalledWith({
      name: 'Treino A',
      description: 'Base semanal',
      type: 'Hipertrofia',
      durationMinutes: 60,
      exercisesCount: 8,
      studentId: 3,
      professionalId: 10,
    });
    expect(workoutsRepository.save).toHaveBeenCalledWith(workout);
  });

  it('should reject invalid workout payloads before checking ownership', async () => {
    await expect(
      service.createForStudent(3, 10, {
        name: '   ',
        type: 'Hipertrofia',
        durationMinutes: 60,
        exercisesCount: 8,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(studentsRepository.findOne).not.toHaveBeenCalled();
    expect(workoutsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject creation when the student does not belong to the professional', async () => {
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createForStudent(3, 10, {
        name: 'Treino A',
        type: 'Hipertrofia',
        durationMinutes: 60,
        exercisesCount: 8,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(workoutsRepository.save).not.toHaveBeenCalled();
  });

  it('should return only workouts from the authenticated professional', async () => {
    const workouts = [
      {
        id: 1,
        name: 'Treino A',
        studentId: 3,
        professionalId: 10,
      },
    ] as Workout[];

    workoutsRepository.find.mockResolvedValue(workouts);

    await expect(service.findAllForProfessional(10)).resolves.toEqual(workouts);
    expect(workoutsRepository.find).toHaveBeenCalledWith({
      where: {
        professionalId: 10,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  });

  it('should list workouts only after confirming professional ownership of the student', async () => {
    const student = { id: 3, professionalId: 10 } as Student;
    const workouts = [
      {
        id: 1,
        name: 'Treino A',
        studentId: 3,
        professionalId: 10,
      },
    ] as Workout[];

    studentsRepository.findOne.mockResolvedValue(student);
    workoutsRepository.find.mockResolvedValue(workouts);

    await expect(service.findByStudentForProfessional(3, 10)).resolves.toEqual(workouts);
    expect(workoutsRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: 3,
        professionalId: 10,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  });

  it('should update a workout only when it belongs to the student and professional', async () => {
    const existingWorkout = {
      id: 1,
      name: 'Treino A',
      description: null,
      type: 'Hipertrofia',
      durationMinutes: 60,
      exercisesCount: 8,
      studentId: 3,
      professionalId: 10,
    } as Workout;
    const data = {
      name: '  Treino B  ',
      description: '  Novo foco  ',
      durationMinutes: 45,
      studentId: 99,
      professionalId: 99,
    } as UpdateWorkoutData & { studentId: number; professionalId: number };
    const updatedWorkout = {
      ...existingWorkout,
      name: 'Treino B',
      description: 'Novo foco',
      durationMinutes: 45,
    } as Workout;

    workoutsRepository.findOne.mockResolvedValue(existingWorkout);
    workoutsRepository.save.mockResolvedValue(updatedWorkout);

    await expect(service.updateForStudent(3, 1, 10, data)).resolves.toEqual(updatedWorkout);
    expect(workoutsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        studentId: 3,
        professionalId: 10,
      },
    });
    expect(workoutsRepository.save).toHaveBeenCalledWith({
      ...existingWorkout,
      name: 'Treino B',
      description: 'Novo foco',
      durationMinutes: 45,
    });
  });

  it('should reject update when the workout does not belong to the student and professional', async () => {
    workoutsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateForStudent(3, 1, 10, {
        name: 'Treino inexistente',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(workoutsRepository.save).not.toHaveBeenCalled();
  });

  it('should remove a workout only when it belongs to the student and professional', async () => {
    workoutsRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.removeForStudent(3, 1, 10)).resolves.toBeUndefined();
    expect(workoutsRepository.delete).toHaveBeenCalledWith({
      id: 1,
      studentId: 3,
      professionalId: 10,
    });
  });

  it('should throw NotFoundException when remove target is not owned by the professional', async () => {
    workoutsRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.removeForStudent(3, 1, 10)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should list workouts linked to the authenticated student user', async () => {
    const students = [
      { id: 3, userId: 20 },
      { id: 4, userId: 20 },
    ] as Student[];
    const workouts = [
      {
        id: 1,
        name: 'Treino A',
        studentId: 3,
        professionalId: 10,
      },
    ] as Workout[];

    studentsRepository.find.mockResolvedValue(students);
    workoutsRepository.find.mockResolvedValue(workouts);

    await expect(service.findForStudentUser(20)).resolves.toEqual(workouts);
    expect(studentsRepository.find).toHaveBeenCalledWith({
      where: {
        userId: 20,
      },
    });
    expect(workoutsRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: expect.any(Object),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  });

  it('should throw NotFoundException when the authenticated student has no student record', async () => {
    studentsRepository.find.mockResolvedValue([]);

    await expect(service.findForStudentUser(20)).rejects.toBeInstanceOf(NotFoundException);
    expect(workoutsRepository.find).not.toHaveBeenCalled();
  });
});
