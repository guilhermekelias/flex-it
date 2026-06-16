import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';

type MockUsersService = {
  create: jest.Mock;
  findAll: jest.Mock;
  login: jest.Mock;
};

type ControllerRequest = Parameters<UsersController['findAll']>[0];

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

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: MockUsersService;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to create a user', async () => {
    const data: Partial<User> = {
      name: 'Patricia Lima',
      email: 'patricia@example.com',
      password: '123456',
      role: UserRole.PROFESSIONAL,
    };
    const userWithoutPassword = {
      id: 1,
      name: 'Patricia Lima',
      email: 'patricia@example.com',
      role: UserRole.PROFESSIONAL,
    };

    usersService.create.mockResolvedValue(userWithoutPassword);

    await expect(controller.create(data)).resolves.toEqual(userWithoutPassword);
    expect(usersService.create).toHaveBeenCalledWith(data);
  });

  it('should call service to find all users', async () => {
    const users = [
      {
        id: 1,
        name: 'Patricia Lima',
        email: 'patricia@example.com',
        role: UserRole.PROFESSIONAL,
      },
    ];

    usersService.findAll.mockResolvedValue(users);

    await expect(controller.findAll(professionalRequest)).resolves.toEqual(users);
    expect(usersService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should reject student users from listing users', () => {
    expect(() => controller.findAll(studentRequest)).toThrow(ForbiddenException);
    expect(usersService.findAll).not.toHaveBeenCalled();
  });

  it('should call service to login', async () => {
    const credentials = {
      email: 'patricia@example.com',
      password: '123456',
    };
    const loginResult = {
      message: 'Login realizado com sucesso',
      user: {
        id: 1,
        name: 'Patricia Lima',
        email: 'patricia@example.com',
        role: UserRole.PROFESSIONAL,
      },
      accessToken: 'valid-jwt-token',
    };

    usersService.login.mockResolvedValue(loginResult);

    await expect(controller.login(credentials)).resolves.toEqual(loginResult);
    expect(usersService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
  });
});
