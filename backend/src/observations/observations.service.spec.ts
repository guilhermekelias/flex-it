import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { Observation, ObservationSenderRole } from './entities/observation.entity';
import { ObservationsService } from './observations.service';
import type { CreateStudentObservationData } from './observations.service';

type MockObservationsRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
};

type MockStudentsRepository = {
  find: jest.Mock;
  findOne: jest.Mock;
};

describe('ObservationsService', () => {
  let service: ObservationsService;
  let observationsRepository: MockObservationsRepository;
  let studentsRepository: MockStudentsRepository;

  beforeEach(async () => {
    observationsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    studentsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObservationsService,
        {
          provide: getRepositoryToken(Observation),
          useValue: observationsRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: studentsRepository,
        },
      ],
    }).compile();

    service = module.get<ObservationsService>(ObservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an observation for a student owned by the professional', async () => {
    const student = { id: 1, professionalId: 10 } as Student;
    const observation = {
      id: 1,
      message: 'Reforcar hidratacao no proximo treino.',
      studentId: 1,
      professionalId: 10,
      senderRole: ObservationSenderRole.PROFESSIONAL,
    } as Observation;

    studentsRepository.findOne.mockResolvedValue(student);
    observationsRepository.create.mockReturnValue(observation);
    observationsRepository.save.mockResolvedValue(observation);

    await expect(
      service.createForStudent(1, 10, {
        message: '  Reforcar hidratacao no proximo treino.  ',
      }),
    ).resolves.toEqual(observation);
    expect(studentsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        professionalId: 10,
      },
    });
    expect(observationsRepository.create).toHaveBeenCalledWith({
      message: 'Reforcar hidratacao no proximo treino.',
      studentId: 1,
      professionalId: 10,
      senderRole: ObservationSenderRole.PROFESSIONAL,
    });
    expect(observationsRepository.save).toHaveBeenCalledWith(observation);
  });

  it('should create an observation from the authenticated student user', async () => {
    const student = { id: 3, userId: 20, professionalId: 10 } as Student;
    const observation = {
      id: 6,
      message: 'Senti dor no joelho no agachamento.',
      studentId: 3,
      professionalId: 10,
      senderRole: ObservationSenderRole.STUDENT,
    } as Observation;
    const payload = {
      studentId: 3,
      professionalId: 999,
      message: '  Senti dor no joelho no agachamento.  ',
    } as unknown as CreateStudentObservationData;

    studentsRepository.findOne.mockResolvedValue(student);
    observationsRepository.create.mockReturnValue(observation);
    observationsRepository.save.mockResolvedValue(observation);

    await expect(service.createForStudentUser(20, payload)).resolves.toEqual(observation);
    expect(studentsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 3,
        userId: 20,
      },
    });
    expect(observationsRepository.create).toHaveBeenCalledWith({
      message: 'Senti dor no joelho no agachamento.',
      studentId: 3,
      professionalId: 10,
      senderRole: ObservationSenderRole.STUDENT,
    });
    expect(observationsRepository.save).toHaveBeenCalledWith(observation);
  });

  it('should reject student observation creation for a student from another user', async () => {
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createForStudentUser(20, {
        studentId: 3,
        message: 'Mensagem valida.',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(observationsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject student observation creation without a linked professional', async () => {
    const student = { id: 3, userId: 20, professionalId: null } as Student;

    studentsRepository.findOne.mockResolvedValue(student);

    await expect(
      service.createForStudentUser(20, {
        studentId: 3,
        message: 'Mensagem valida.',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(observationsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject empty observation messages', async () => {
    await expect(service.createForStudent(1, 10, { message: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(studentsRepository.findOne).not.toHaveBeenCalled();
    expect(observationsRepository.save).not.toHaveBeenCalled();
  });

  it('should reject creation when the student does not belong to the professional', async () => {
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createForStudent(1, 10, {
        message: 'Mensagem valida.',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(observationsRepository.save).not.toHaveBeenCalled();
  });

  it('should list observations only after confirming professional ownership', async () => {
    const student = { id: 1, professionalId: 10 } as Student;
    const observations = [
      {
        id: 2,
        message: 'Ajustar carga do treino A.',
        studentId: 1,
        professionalId: 10,
      },
    ] as Observation[];

    studentsRepository.findOne.mockResolvedValue(student);
    observationsRepository.find.mockResolvedValue(observations);

    await expect(service.findByStudentForProfessional(1, 10)).resolves.toEqual(observations);
    expect(observationsRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: 1,
        professionalId: 10,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  });

  it('should reject listing when the student does not belong to the professional', async () => {
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(service.findByStudentForProfessional(1, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(observationsRepository.find).not.toHaveBeenCalled();
  });

  it('should list observations linked to the authenticated student user', async () => {
    const students = [
      { id: 3, userId: 20 },
      { id: 4, userId: 20 },
    ] as Student[];
    const observations = [
      {
        id: 5,
        message: 'Manter registro de sono nesta semana.',
        studentId: 3,
        professionalId: 10,
      },
    ] as Observation[];

    studentsRepository.find.mockResolvedValue(students);
    observationsRepository.find.mockResolvedValue(observations);

    await expect(service.findForStudentUser(20)).resolves.toEqual(observations);
    expect(studentsRepository.find).toHaveBeenCalledWith({
      where: {
        userId: 20,
      },
    });
    expect(observationsRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: expect.any(Object),
      },
      order: {
        createdAt: 'ASC',
      },
    });
  });

  it('should list observation threads for each linked student record', async () => {
    const students = [
      { id: 3, userId: 20, professionalId: 10 },
      { id: 4, userId: 20, professionalId: 11 },
    ] as Student[];
    const observations = [
      {
        id: 5,
        message: 'Manter registro de sono nesta semana.',
        studentId: 3,
        professionalId: 10,
      },
    ] as Observation[];

    studentsRepository.find.mockResolvedValue(students);
    observationsRepository.find.mockResolvedValue(observations);

    await expect(service.findThreadsForStudentUser(20)).resolves.toEqual([
      {
        studentId: 3,
        professionalId: 10,
        messages: observations,
      },
      {
        studentId: 4,
        professionalId: 11,
        messages: [],
      },
    ]);
    expect(studentsRepository.find).toHaveBeenCalledWith({
      where: {
        userId: 20,
      },
      order: {
        id: 'ASC',
      },
    });
    expect(observationsRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: expect.any(Object),
      },
      order: {
        createdAt: 'ASC',
      },
    });
  });

  it('should throw NotFoundException when the authenticated student has no student record', async () => {
    studentsRepository.find.mockResolvedValue([]);

    await expect(service.findForStudentUser(20)).rejects.toBeInstanceOf(NotFoundException);
    expect(observationsRepository.find).not.toHaveBeenCalled();
  });
});
