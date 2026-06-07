import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { Metric } from './entities/metric.entity';
import { CreateMetricData, MetricsService, UpdateMetricData } from './metrics.service';

type MockMetricsRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  delete: jest.Mock;
};

type MockStudentsRepository = {
  find: jest.Mock;
  findOne: jest.Mock;
};

describe('MetricsService', () => {
  let service: MetricsService;
  let metricsRepository: MockMetricsRepository;
  let studentsRepository: MockStudentsRepository;

  beforeEach(async () => {
    metricsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    studentsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getRepositoryToken(Metric),
          useValue: metricsRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: studentsRepository,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a metric for a student owned by the professional', async () => {
    const recordedAt = '2026-06-01T12:00:00.000Z';
    const expectedRecordedAt = new Date(recordedAt);
    const student = { id: 3, professionalId: 10 } as Student;
    const data = {
      weightKg: 72.4,
      heightCm: 170,
      bodyFatPercentage: 21.8,
      muscleMassKg: 54.6,
      notes: '  Avaliacao inicial  ',
      recordedAt,
      studentId: 99,
      professionalId: 99,
    } as CreateMetricData & { studentId: number; professionalId: number };
    const metric = {
      id: 1,
      weightKg: 72.4,
      heightCm: 170,
      bodyFatPercentage: 21.8,
      muscleMassKg: 54.6,
      notes: 'Avaliacao inicial',
      recordedAt: expectedRecordedAt,
      studentId: 3,
      professionalId: 10,
    } as Metric;

    studentsRepository.findOne.mockResolvedValue(student);
    metricsRepository.create.mockReturnValue(metric);
    metricsRepository.save.mockResolvedValue(metric);

    await expect(service.createForStudent(3, 10, data)).resolves.toEqual(metric);
    expect(studentsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 3,
        professionalId: 10,
      },
    });
    expect(metricsRepository.create).toHaveBeenCalledWith({
      weightKg: 72.4,
      heightCm: 170,
      bodyFatPercentage: 21.8,
      muscleMassKg: 54.6,
      notes: 'Avaliacao inicial',
      recordedAt: expectedRecordedAt,
      studentId: 3,
      professionalId: 10,
    });
    expect(metricsRepository.save).toHaveBeenCalledWith(metric);
  });

  it('should reject invalid metric payloads before checking ownership', async () => {
    await expect(
      service.createForStudent(3, 10, {
        weightKg: -1,
        heightCm: 170,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(studentsRepository.findOne).not.toHaveBeenCalled();
    expect(metricsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject creation without a body metric value', async () => {
    await expect(
      service.createForStudent(3, 10, {
        notes: 'Somente anotacao',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(studentsRepository.findOne).not.toHaveBeenCalled();
    expect(metricsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject creation when the student does not belong to the professional', async () => {
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createForStudent(3, 10, {
        weightKg: 72.4,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(metricsRepository.save).not.toHaveBeenCalled();
  });

  it('should return only metrics from the authenticated professional', async () => {
    const metrics = [
      {
        id: 1,
        weightKg: 72.4,
        studentId: 3,
        professionalId: 10,
      },
    ] as Metric[];

    metricsRepository.find.mockResolvedValue(metrics);

    await expect(service.findAllForProfessional(10)).resolves.toEqual(metrics);
    expect(metricsRepository.find).toHaveBeenCalledWith({
      where: {
        professionalId: 10,
      },
      order: {
        recordedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  });

  it('should list metrics only after confirming professional ownership of the student', async () => {
    const student = { id: 3, professionalId: 10 } as Student;
    const metrics = [
      {
        id: 1,
        weightKg: 72.4,
        studentId: 3,
        professionalId: 10,
      },
    ] as Metric[];

    studentsRepository.findOne.mockResolvedValue(student);
    metricsRepository.find.mockResolvedValue(metrics);

    await expect(service.findByStudentForProfessional(3, 10)).resolves.toEqual(metrics);
    expect(metricsRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: 3,
        professionalId: 10,
      },
      order: {
        recordedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  });

  it('should reject listing when the student does not belong to the professional', async () => {
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(service.findByStudentForProfessional(3, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(metricsRepository.find).not.toHaveBeenCalled();
  });

  it('should update a metric only when it belongs to the student and professional', async () => {
    const existingMetric = {
      id: 1,
      weightKg: 72.4,
      heightCm: 170,
      bodyFatPercentage: 21.8,
      muscleMassKg: 54.6,
      notes: null,
      studentId: 3,
      professionalId: 10,
    } as Metric;
    const data = {
      weightKg: 73,
      notes: '  Ajuste semanal  ',
      studentId: 99,
      professionalId: 99,
    } as UpdateMetricData & { studentId: number; professionalId: number };
    const updatedMetric = {
      ...existingMetric,
      weightKg: 73,
      notes: 'Ajuste semanal',
    } as Metric;

    metricsRepository.findOne.mockResolvedValue(existingMetric);
    metricsRepository.save.mockResolvedValue(updatedMetric);

    await expect(service.updateForStudent(3, 1, 10, data)).resolves.toEqual(updatedMetric);
    expect(metricsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        studentId: 3,
        professionalId: 10,
      },
    });
    expect(metricsRepository.save).toHaveBeenCalledWith({
      ...existingMetric,
      weightKg: 73,
      notes: 'Ajuste semanal',
    });
  });

  it('should reject update payloads without supported metric fields', async () => {
    await expect(
      service.updateForStudent(3, 1, 10, {
        studentId: 99,
      } as UpdateMetricData & { studentId: number }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(metricsRepository.findOne).not.toHaveBeenCalled();
    expect(metricsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject update when the metric does not belong to the student and professional', async () => {
    metricsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateForStudent(3, 1, 10, {
        weightKg: 73,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(metricsRepository.save).not.toHaveBeenCalled();
  });

  it('should remove a metric only when it belongs to the student and professional', async () => {
    metricsRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.removeForStudent(3, 1, 10)).resolves.toBeUndefined();
    expect(metricsRepository.delete).toHaveBeenCalledWith({
      id: 1,
      studentId: 3,
      professionalId: 10,
    });
  });

  it('should throw NotFoundException when remove target is not owned by the professional', async () => {
    metricsRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.removeForStudent(3, 1, 10)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should list metrics linked to the authenticated student email', async () => {
    const student = { id: 3, email: 'ana@example.com' } as Student;
    const metrics = [
      {
        id: 1,
        weightKg: 72.4,
        studentId: 3,
        professionalId: 10,
      },
    ] as Metric[];

    studentsRepository.find.mockResolvedValue([student]);
    metricsRepository.find.mockResolvedValue(metrics);

    await expect(service.findForStudentUser('  ANA@example.com  ')).resolves.toEqual(metrics);
    expect(studentsRepository.find).toHaveBeenCalledWith({
      where: {
        email: expect.any(Object),
      },
    });
    expect(metricsRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: 3,
      },
      order: {
        recordedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  });

  it('should throw NotFoundException when the authenticated student has no student record', async () => {
    studentsRepository.find.mockResolvedValue([]);

    await expect(service.findForStudentUser('sem-vinculo@example.com')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(metricsRepository.find).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when the authenticated student email is empty', async () => {
    await expect(service.findForStudentUser('   ')).rejects.toBeInstanceOf(NotFoundException);
    expect(studentsRepository.find).not.toHaveBeenCalled();
    expect(metricsRepository.find).not.toHaveBeenCalled();
  });

  it('should reject student lookup when the email matches more than one student record', async () => {
    studentsRepository.find.mockResolvedValue([
      { id: 1, email: 'ana@example.com' },
      { id: 2, email: 'ana@example.com' },
    ]);

    await expect(service.findForStudentUser('ana@example.com')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(metricsRepository.find).not.toHaveBeenCalled();
  });
});
