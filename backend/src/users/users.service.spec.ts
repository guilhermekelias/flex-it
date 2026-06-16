import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Student } from '../students/entities/student.entity';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';

type MockUsersRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
};

type MockJwtService = {
  signAsync: jest.Mock;
};

type MockStudentsRepository = {
  find: jest.Mock;
  save: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockUsersRepository;
  let studentsRepository: MockStudentsRepository;
  let jwtService: MockJwtService;

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    studentsRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('valid-jwt-token'),
    };
    usersRepository.findOne.mockResolvedValue(null);
    studentsRepository.find.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: studentsRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user without returning the password', async () => {
    const data: Partial<User> = {
      name: 'Patricia Lima',
      email: 'patricia@example.com',
      password: '123456',
      role: UserRole.PROFESSIONAL,
    };
    const user = { id: 1, ...data } as User;

    usersRepository.create.mockReturnValue(user);
    usersRepository.save.mockResolvedValue(user);

    const result = await service.create(data);

    expect(result).toEqual({
      id: 1,
      name: 'Patricia Lima',
      email: 'patricia@example.com',
      role: UserRole.PROFESSIONAL,
    });
    expect(result).not.toHaveProperty('password');
    expect(usersRepository.create).toHaveBeenCalledWith(data);
    expect(usersRepository.save).toHaveBeenCalledWith(user);
    expect(studentsRepository.find).not.toHaveBeenCalled();
  });

  it('should link pending students when creating a student user', async () => {
    const data = {
      name: 'Ana Silva',
      email: ' ANA@example.com ',
      password: '123456',
      role: UserRole.STUDENT,
    };
    const pendingStudents = [
      { id: 1, email: 'ana@example.com', userId: null },
      { id: 2, email: 'ana@example.com', userId: null },
    ] as Student[];
    const user = {
      id: 2,
      name: 'Ana Silva',
      email: 'ana@example.com',
      password: '123456',
      role: UserRole.STUDENT,
    } as User;

    usersRepository.create.mockReturnValue(user);
    usersRepository.save.mockResolvedValue(user);
    studentsRepository.find.mockResolvedValue(pendingStudents);

    await expect(service.create(data)).resolves.toEqual({
      id: 2,
      name: 'Ana Silva',
      email: 'ana@example.com',
      role: UserRole.STUDENT,
    });
    expect(usersRepository.create).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@example.com',
      password: '123456',
      role: UserRole.STUDENT,
    });
    expect(studentsRepository.find).toHaveBeenCalledWith({
      where: {
        userId: expect.any(Object),
        email: expect.any(Object),
      },
    });
    expect(studentsRepository.save).toHaveBeenCalledWith([
      { id: 1, email: 'ana@example.com', userId: 2 },
      { id: 2, email: 'ana@example.com', userId: 2 },
    ]);
  });

  it('should reject duplicate user email', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'ana@example.com',
      role: UserRole.STUDENT,
    });

    await expect(
      service.create({
        name: 'Ana Silva',
        email: 'ana@example.com',
        password: '123456',
        role: UserRole.STUDENT,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersRepository.create).not.toHaveBeenCalled();
  });

  it('should reject invalid user role', async () => {
    await expect(
      service.create({
        name: 'Ana Silva',
        email: 'ana@example.com',
        password: '123456',
        role: 'admin',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(usersRepository.findOne).not.toHaveBeenCalled();
  });

  it('should return all users without passwords', async () => {
    const users = [
      {
        id: 1,
        name: 'Patricia Lima',
        email: 'patricia@example.com',
        password: '123456',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: 2,
        name: 'Carlos Mendes',
        email: 'carlos@example.com',
        password: 'abcdef',
        role: UserRole.STUDENT,
      },
    ] as User[];

    usersRepository.find.mockResolvedValue(users);

    await expect(service.findAll()).resolves.toEqual([
      {
        id: 1,
        name: 'Patricia Lima',
        email: 'patricia@example.com',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: 2,
        name: 'Carlos Mendes',
        email: 'carlos@example.com',
        role: UserRole.STUDENT,
      },
    ]);
  });

  it('should find a user by email', async () => {
    const user = {
      id: 1,
      name: 'Patricia Lima',
      email: 'patricia@example.com',
      password: '123456',
      role: UserRole.PROFESSIONAL,
    } as User;

    usersRepository.findOne.mockResolvedValue(user);

    await expect(service.findByEmail('patricia@example.com')).resolves.toEqual(user);
    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: {
        email: expect.any(Object),
      },
    });
  });

  it('should login with valid credentials without returning the password', async () => {
    const user = {
      id: 1,
      name: 'Patricia Lima',
      email: 'patricia@example.com',
      password: '123456',
      role: UserRole.PROFESSIONAL,
    } as User;

    usersRepository.findOne.mockResolvedValue(user);

    const result = await service.login('patricia@example.com', '123456');

    expect(result).toEqual({
      message: expect.any(String),
      user: {
        id: 1,
        name: 'Patricia Lima',
        email: 'patricia@example.com',
        role: UserRole.PROFESSIONAL,
      },
      accessToken: 'valid-jwt-token',
    });
    expect(result.user).not.toHaveProperty('password');
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 1,
      email: 'patricia@example.com',
      role: UserRole.PROFESSIONAL,
    });
  });

  it('should reject login when user is not found', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(service.login('missing@example.com', '123456')).resolves.toEqual({
      message: expect.any(String),
    });
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should reject login when password is invalid', async () => {
    const user = {
      id: 1,
      name: 'Patricia Lima',
      email: 'patricia@example.com',
      password: '123456',
      role: UserRole.PROFESSIONAL,
    } as User;

    usersRepository.findOne.mockResolvedValue(user);

    await expect(service.login('patricia@example.com', 'invalid')).resolves.toEqual({
      message: expect.any(String),
    });
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
