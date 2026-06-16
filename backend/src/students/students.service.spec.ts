import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';

type MockStudentsRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  delete: jest.Mock;
};

type MockUsersRepository = {
  findOne: jest.Mock;
};

describe('StudentsService', () => {
  let service: StudentsService;
  let studentsRepository: MockStudentsRepository;
  let usersRepository: MockUsersRepository;

  beforeEach(async () => {
    studentsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    usersRepository = {
      findOne: jest.fn(),
    };
    usersRepository.findOne.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: studentsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
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
      userId: null,
    });
    expect(studentsRepository.save).toHaveBeenCalledWith(student);
  });

  it('should create a student linked to an existing student user with the same email', async () => {
    const data: Partial<Student> = {
      name: 'Ana Silva',
      email: ' ANA@example.com ',
      age: 28,
      goal: 'Hipertrofia',
    };
    const user = {
      id: 20,
      email: 'ana@example.com',
      role: UserRole.STUDENT,
    } as User;
    const student = {
      id: 1,
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
      professionalId: 10,
      userId: 20,
    } as Student;

    usersRepository.findOne.mockResolvedValue(user);
    studentsRepository.create.mockReturnValue(student);
    studentsRepository.save.mockResolvedValue(student);

    await expect(service.create(data, 10)).resolves.toEqual(student);
    expect(studentsRepository.create).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
      professionalId: 10,
      userId: 20,
    });
  });

  it('should reject student creation when the email belongs to a professional user', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 30,
      email: 'patricia@example.com',
      role: UserRole.PROFESSIONAL,
    });

    await expect(
      service.create(
        {
          name: 'Ana Silva',
          email: 'patricia@example.com',
          age: 28,
          goal: 'Hipertrofia',
        },
        10,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(studentsRepository.create).not.toHaveBeenCalled();
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
      userId: null,
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

  it('should update the student user link when the email changes', async () => {
    const existingStudent = {
      id: 1,
      name: 'Ana Silva',
      email: 'ana@example.com',
      age: 28,
      goal: 'Hipertrofia',
      professionalId: 10,
      userId: null,
    } as Student;
    const user = {
      id: 20,
      email: 'novo@example.com',
      role: UserRole.STUDENT,
    } as User;
    const updatedStudent = {
      ...existingStudent,
      email: 'novo@example.com',
      userId: 20,
    } as Student;

    studentsRepository.findOne.mockResolvedValue(existingStudent);
    usersRepository.findOne.mockResolvedValue(user);
    studentsRepository.save.mockResolvedValue(updatedStudent);

    await expect(service.update(1, { email: 'novo@example.com' }, 10)).resolves.toEqual(
      updatedStudent,
    );
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
