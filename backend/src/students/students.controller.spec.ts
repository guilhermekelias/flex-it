import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { UserRole } from '../users/entities/user.entity';

type MockStudentsService = {
  create: jest.Mock;
  findAll: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

type ControllerRequest = Parameters<StudentsController['findAll']>[0];

const professionalRequest = {
  user: {
    sub: 10,
    email: 'patricia@example.com',
    role: UserRole.PROFESSIONAL,
  },
} as ControllerRequest;

const studentRequest = {
  user: {
    sub: 20,
    email: 'ana@example.com',
    role: UserRole.STUDENT,
  },
} as ControllerRequest;

describe('StudentsController', () => {
  let controller: StudentsController;
  let studentsService: MockStudentsService;

  beforeEach(async () => {
    studentsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: studentsService,
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to create a student for the authenticated professional', async () => {
    const data: Partial<Student> = {
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
    };
    const student = { id: 1, ...data, professionalId: 10 } as Student;

    studentsService.create.mockResolvedValue(student);

    await expect(controller.create(data, professionalRequest)).resolves.toEqual(student);
    expect(studentsService.create).toHaveBeenCalledWith(data, 10);
  });

  it('should call service to find only students from the authenticated professional', async () => {
    const students = [
      {
        id: 1,
        name: 'Ana Silva',
        email: 'ana@example.com',
        age: 28,
        goal: 'Hipertrofia',
        professionalId: 10,
      },
    ] as Student[];

    studentsService.findAll.mockResolvedValue(students);

    await expect(controller.findAll(professionalRequest)).resolves.toEqual(students);
    expect(studentsService.findAll).toHaveBeenCalledWith(10);
  });

  it('should call service to update a student from the authenticated professional', async () => {
    const data: Partial<Student> = {
      goal: 'Condicionamento',
    };
    const student = {
      id: 1,
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Condicionamento',
      professionalId: 10,
    } as Student;

    studentsService.update.mockResolvedValue(student);

    await expect(controller.update(1, data, professionalRequest)).resolves.toEqual(student);
    expect(studentsService.update).toHaveBeenCalledWith(1, data, 10);
  });

  it('should call service to remove a student from the authenticated professional', async () => {
    studentsService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1, professionalRequest)).resolves.toBeUndefined();
    expect(studentsService.remove).toHaveBeenCalledWith(1, 10);
  });

  it('should reject student users from managing students', () => {
    expect(() => controller.findAll(studentRequest)).toThrow(ForbiddenException);
    expect(studentsService.findAll).not.toHaveBeenCalled();
  });
});
