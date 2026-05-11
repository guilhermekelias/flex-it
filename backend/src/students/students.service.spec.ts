import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';

type MockStudentsRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  preload: jest.Mock;
  delete: jest.Mock;
};

describe('StudentsService', () => {
  let service: StudentsService;
  let studentsRepository: MockStudentsRepository;

  beforeEach(async () => {
    studentsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: studentsRepository,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a student', async () => {
    const data: Partial<Student> = {
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
    };
    const student = { id: 1, ...data } as Student;

    studentsRepository.create.mockReturnValue(student);
    studentsRepository.save.mockResolvedValue(student);

    await expect(service.create(data)).resolves.toEqual(student);
    expect(studentsRepository.create).toHaveBeenCalledWith(data);
    expect(studentsRepository.save).toHaveBeenCalledWith(student);
  });

  it('should return all students', async () => {
    const students = [
      {
        id: 1,
        name: 'Ana Silva',
        email: 'ana@example.com',
        age: 28,
        goal: 'Hipertrofia',
      },
      {
        id: 2,
        name: 'Bruno Souza',
        email: 'bruno@example.com',
        age: 32,
        goal: 'Emagrecimento',
      },
    ] as Student[];

    studentsRepository.find.mockResolvedValue(students);

    await expect(service.findAll()).resolves.toEqual(students);
    expect(studentsRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should update a student', async () => {
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

    studentsRepository.preload.mockResolvedValue(student);
    studentsRepository.save.mockResolvedValue(student);

    await expect(service.update(1, data)).resolves.toEqual(student);
    expect(studentsRepository.preload).toHaveBeenCalledWith({ ...data, id: 1 });
    expect(studentsRepository.save).toHaveBeenCalledWith(student);
  });

  it('should throw NotFoundException when student update target does not exist', async () => {
    studentsRepository.preload.mockResolvedValue(null);

    await expect(service.update(999, { name: 'Aluno inexistente' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(studentsRepository.save).not.toHaveBeenCalled();
  });

  it('should remove a student', async () => {
    studentsRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(studentsRepository.delete).toHaveBeenCalledWith(1);
  });
});
