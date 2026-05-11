import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';

type MockStudentsService = {
  create: jest.Mock;
  findAll: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

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

  it('should call service to create a student', async () => {
    const data: Partial<Student> = {
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
    };
    const student = { id: 1, ...data } as Student;

    studentsService.create.mockResolvedValue(student);

    await expect(controller.create(data)).resolves.toEqual(student);
    expect(studentsService.create).toHaveBeenCalledWith(data);
  });

  it('should call service to find all students', async () => {
    const students = [
      {
        id: 1,
        name: 'Ana Silva',
        email: 'ana@example.com',
        age: 28,
        goal: 'Hipertrofia',
      },
    ] as Student[];

    studentsService.findAll.mockResolvedValue(students);

    await expect(controller.findAll()).resolves.toEqual(students);
    expect(studentsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should call service to update a student', async () => {
    const data: Partial<Student> = {
      goal: 'Condicionamento',
    };
    const student = {
      id: 1,
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Condicionamento',
    } as Student;

    studentsService.update.mockResolvedValue(student);

    await expect(controller.update(1, data)).resolves.toEqual(student);
    expect(studentsService.update).toHaveBeenCalledWith(1, data);
  });

  it('should call service to remove a student', async () => {
    studentsService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(studentsService.remove).toHaveBeenCalledWith(1);
  });
});
