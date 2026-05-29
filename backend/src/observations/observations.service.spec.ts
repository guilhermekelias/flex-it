import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { Observation } from './entities/observation.entity';
import { ObservationsService } from './observations.service';

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
    });
    expect(observationsRepository.save).toHaveBeenCalledWith(observation);
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
        createdAt: 'DESC',
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

  it('should list observations linked to the authenticated student email', async () => {
    const student = { id: 3, email: 'ana@example.com' } as Student;
    const observations = [
      {
        id: 5,
        message: 'Manter registro de sono nesta semana.',
        studentId: 3,
        professionalId: 10,
      },
    ] as Observation[];

    studentsRepository.find.mockResolvedValue([student]);
    observationsRepository.find.mockResolvedValue(observations);

    await expect(service.findForStudentUser('  ANA@example.com  ')).resolves.toEqual(observations);
    expect(studentsRepository.find).toHaveBeenCalledWith({
      where: {
        email: expect.any(Object),
      },
    });
    expect(observationsRepository.find).toHaveBeenCalledWith({
      where: {
        studentId: 3,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  });

  it('should throw NotFoundException when the authenticated student has no student record', async () => {
    studentsRepository.find.mockResolvedValue([]);

    await expect(service.findForStudentUser('sem-vinculo@example.com')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(observationsRepository.find).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when the authenticated student email is empty', async () => {
    await expect(service.findForStudentUser('   ')).rejects.toBeInstanceOf(NotFoundException);
    expect(studentsRepository.find).not.toHaveBeenCalled();
    expect(observationsRepository.find).not.toHaveBeenCalled();
  });

  it('should reject student lookup when the email matches more than one student record', async () => {
    studentsRepository.find.mockResolvedValue([
      { id: 1, email: 'ana@example.com' },
      { id: 2, email: 'ana@example.com' },
    ]);

    await expect(service.findForStudentUser('ana@example.com')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(observationsRepository.find).not.toHaveBeenCalled();
  });
});
