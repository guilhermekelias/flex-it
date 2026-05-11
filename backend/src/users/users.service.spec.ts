import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
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

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockUsersRepository;
  let jwtService: MockJwtService;

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('valid-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
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
      where: { email: 'patricia@example.com' },
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
