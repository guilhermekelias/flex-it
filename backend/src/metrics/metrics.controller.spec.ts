import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../users/entities/user.entity';
import { Metric } from './entities/metric.entity';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

type MockMetricsService = {
  createForStudent: jest.Mock;
  findAllForProfessional: jest.Mock;
  findByStudentForProfessional: jest.Mock;
  updateForStudent: jest.Mock;
  removeForStudent: jest.Mock;
  findForStudentUser: jest.Mock;
};

type ProfessionalRequest = Parameters<MetricsController['findAllForProfessional']>[0];
type StudentRequest = Parameters<MetricsController['findForCurrentStudent']>[0];

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

describe('MetricsController', () => {
  let controller: MetricsController;
  let metricsService: MockMetricsService;

  beforeEach(async () => {
    metricsService = {
      createForStudent: jest.fn(),
      findAllForProfessional: jest.fn(),
      findByStudentForProfessional: jest.fn(),
      updateForStudent: jest.fn(),
      removeForStudent: jest.fn(),
      findForStudentUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: metricsService,
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should allow professional users to list their metrics', async () => {
    const metrics = [
      {
        id: 1,
        weightKg: 72.4,
        studentId: 3,
        professionalId: 10,
      },
    ] as Metric[];

    metricsService.findAllForProfessional.mockResolvedValue(metrics);

    await expect(controller.findAllForProfessional(professionalRequest)).resolves.toEqual(
      metrics,
    );
    expect(metricsService.findAllForProfessional).toHaveBeenCalledWith(10);
  });

  it('should allow professional users to create metrics for a student', async () => {
    const body = {
      weightKg: 72.4,
      heightCm: 170,
      bodyFatPercentage: 21.8,
      muscleMassKg: 54.6,
      notes: 'Avaliacao inicial',
      recordedAt: '2026-06-01T12:00:00.000Z',
    };
    const metric = {
      id: 1,
      ...body,
      recordedAt: new Date(body.recordedAt),
      studentId: 3,
      professionalId: 10,
    } as Metric;

    metricsService.createForStudent.mockResolvedValue(metric);

    await expect(controller.createForStudent(3, body, professionalRequest)).resolves.toEqual(
      metric,
    );
    expect(metricsService.createForStudent).toHaveBeenCalledWith(3, 10, body);
  });

  it('should allow professional users to list metrics from a student', async () => {
    const metrics = [
      {
        id: 1,
        weightKg: 72.4,
        studentId: 3,
        professionalId: 10,
      },
    ] as Metric[];

    metricsService.findByStudentForProfessional.mockResolvedValue(metrics);

    await expect(
      controller.findByStudentForProfessional(3, professionalRequest),
    ).resolves.toEqual(metrics);
    expect(metricsService.findByStudentForProfessional).toHaveBeenCalledWith(3, 10);
  });

  it('should allow professional users to update metrics from a student', async () => {
    const body = {
      weightKg: 73,
    };
    const metric = {
      id: 1,
      weightKg: 73,
      studentId: 3,
      professionalId: 10,
    } as Metric;

    metricsService.updateForStudent.mockResolvedValue(metric);

    await expect(controller.updateForStudent(3, 1, body, professionalRequest)).resolves.toEqual(
      metric,
    );
    expect(metricsService.updateForStudent).toHaveBeenCalledWith(3, 1, 10, body);
  });

  it('should allow professional users to remove metrics from a student', async () => {
    metricsService.removeForStudent.mockResolvedValue(undefined);

    await expect(controller.removeForStudent(3, 1, professionalRequest)).resolves.toBeUndefined();
    expect(metricsService.removeForStudent).toHaveBeenCalledWith(3, 1, 10);
  });

  it('should reject student users from professional metric routes', () => {
    expect(() =>
      controller.findByStudentForProfessional(3, studentRequest as ProfessionalRequest),
    ).toThrow(ForbiddenException);
    expect(metricsService.findByStudentForProfessional).not.toHaveBeenCalled();
  });

  it('should allow student users to list their own metrics', async () => {
    const metrics = [
      {
        id: 1,
        weightKg: 72.4,
        studentId: 3,
        professionalId: 10,
      },
    ] as Metric[];

    metricsService.findForStudentUser.mockResolvedValue(metrics);

    await expect(controller.findForCurrentStudent(studentRequest)).resolves.toEqual(metrics);
    expect(metricsService.findForStudentUser).toHaveBeenCalledWith('ana@example.com');
  });

  it('should reject professional users from the student metric route', () => {
    expect(() =>
      controller.findForCurrentStudent(professionalRequest as StudentRequest),
    ).toThrow(ForbiddenException);
    expect(metricsService.findForStudentUser).not.toHaveBeenCalled();
  });
});
