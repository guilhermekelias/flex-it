import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';

type MockStudentsRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
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
      findOne: jest.fn(),
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

  it('should create a student linked to the authenticated professional', async () => {
    const data: Partial<Student> = {
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
    };
    const student = { id: 1, ...data, professionalId: 10 } as Student;

    studentsRepository.create.mockReturnValue(student);
    studentsRepository.save.mockResolvedValue(student);

    await expect(service.create(data, 10)).resolves.toEqual(student);
    expect(studentsRepository.create).toHaveBeenCalledWith({
      ...data,
      professionalId: 10,
    });
    expect(studentsRepository.save).toHaveBeenCalledWith(student);
  });

  it('should ignore professional fields sent in the payload when creating a student', async () => {
    const data = {
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
      professionalId: 99,
    } as Partial<Student>;
    const student = {
      id: 1,
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
      professionalId: 10,
    } as Student;

    studentsRepository.create.mockReturnValue(student);
    studentsRepository.save.mockResolvedValue(student);

    await expect(service.create(data, 10)).resolves.toEqual(student);
    expect(studentsRepository.create).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
      professionalId: 10,
    });
  });

  it('should return only students from the authenticated professional', async () => {
    const students = [
      {
        id: 1,
        name: 'Ana Silva',
        email: 'ana@example.com',
        age: 28,
        goal: 'Hipertrofia',
        professionalId: 10,
      },
      {
        id: 2,
        name: 'Bruno Souza',
        email: 'bruno@example.com',
        age: 32,
        goal: 'Emagrecimento',
        professionalId: 10,
      },
    ] as Student[];

    studentsRepository.find.mockResolvedValue(students);

    await expect(service.findAll(10)).resolves.toEqual(students);
    expect(studentsRepository.find).toHaveBeenCalledWith({
      where: { professionalId: 10 },
    });
  });

  it('should update a student owned by the authenticated professional', async () => {
    const data: Partial<Student> = {
      goal: 'Condicionamento',
    };
    const existingStudent = {
      id: 1,
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
      professionalId: 10,
    } as Student;
    const updatedStudent = {
      ...existingStudent,
      goal: 'Condicionamento',
    } as Student;

    studentsRepository.findOne.mockResolvedValue(existingStudent);
    studentsRepository.save.mockResolvedValue(updatedStudent);

    await expect(service.update(1, data, 10)).resolves.toEqual(updatedStudent);
    expect(studentsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        professionalId: 10,
      },
    });
    expect(studentsRepository.save).toHaveBeenCalledWith(updatedStudent);
  });

  it('should throw NotFoundException when update target does not belong to the professional', async () => {
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(service.update(999, { name: 'Aluno inexistente' }, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(studentsRepository.save).not.toHaveBeenCalled();
  });

  it('should remove a student owned by the authenticated professional', async () => {
    studentsRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1, 10)).resolves.toBeUndefined();
    expect(studentsRepository.delete).toHaveBeenCalledWith({
      id: 1,
      professionalId: 10,
    });
  });

  it('should throw NotFoundException when remove target does not belong to the professional', async () => {
    studentsRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(1, 10)).rejects.toBeInstanceOf(NotFoundException);
  });
});
