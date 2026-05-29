import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../users/entities/user.entity';
import { Observation } from './entities/observation.entity';
import { ObservationsController } from './observations.controller';
import { ObservationsService } from './observations.service';

type MockObservationsService = {
  createForStudent: jest.Mock;
  findByStudentForProfessional: jest.Mock;
  findForStudentUser: jest.Mock;
};

type ProfessionalRequest = Parameters<ObservationsController['findByStudentForProfessional']>[1];
type StudentRequest = Parameters<ObservationsController['findForCurrentStudent']>[0];

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

describe('ObservationsController', () => {
  let controller: ObservationsController;
  let observationsService: MockObservationsService;

  beforeEach(async () => {
    observationsService = {
      createForStudent: jest.fn(),
      findByStudentForProfessional: jest.fn(),
      findForStudentUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservationsController],
      providers: [
        {
          provide: ObservationsService,
          useValue: observationsService,
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ObservationsController>(ObservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should allow professional users to create observations for a student', async () => {
    const body = { message: 'Acompanhar fadiga no treino de pernas.' };
    const observation = {
      id: 1,
      ...body,
      studentId: 3,
      professionalId: 10,
    } as Observation;

    observationsService.createForStudent.mockResolvedValue(observation);

    await expect(controller.createForStudent(3, body, professionalRequest)).resolves.toEqual(
      observation,
    );
    expect(observationsService.createForStudent).toHaveBeenCalledWith(3, 10, body);
  });

  it('should allow professional users to list observations from a student', async () => {
    const observations = [
      {
        id: 1,
        message: 'Ajustar ingestao de agua.',
        studentId: 3,
        professionalId: 10,
      },
    ] as Observation[];

    observationsService.findByStudentForProfessional.mockResolvedValue(observations);

    await expect(controller.findByStudentForProfessional(3, professionalRequest)).resolves.toEqual(
      observations,
    );
    expect(observationsService.findByStudentForProfessional).toHaveBeenCalledWith(3, 10);
  });

  it('should reject student users from professional observation routes', () => {
    expect(() => controller.findByStudentForProfessional(3, studentRequest as ProfessionalRequest)).toThrow(
      ForbiddenException,
    );
    expect(observationsService.findByStudentForProfessional).not.toHaveBeenCalled();
  });

  it('should allow student users to list their own observations', async () => {
    const observations = [
      {
        id: 1,
        message: 'Registrar dor ou desconforto apos o treino.',
        studentId: 3,
        professionalId: 10,
      },
    ] as Observation[];

    observationsService.findForStudentUser.mockResolvedValue(observations);

    await expect(controller.findForCurrentStudent(studentRequest)).resolves.toEqual(observations);
    expect(observationsService.findForStudentUser).toHaveBeenCalledWith('ana@example.com');
  });

  it('should reject professional users from the student observation route', () => {
    expect(() => controller.findForCurrentStudent(professionalRequest as StudentRequest)).toThrow(
      ForbiddenException,
    );
    expect(observationsService.findForStudentUser).not.toHaveBeenCalled();
  });
});
