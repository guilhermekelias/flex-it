import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { findProfessionalStudentOrFail } from '../common/students/find-professional-student';
import { Student } from '../students/entities/student.entity';
import { Metric } from './entities/metric.entity';

export type CreateMetricData = {
  weightKg?: unknown;
  heightCm?: unknown;
  bodyFatPercentage?: unknown;
  muscleMassKg?: unknown;
  notes?: unknown;
  recordedAt?: unknown;
};

export type UpdateMetricData = Partial<CreateMetricData>;

type NormalizedMetricData = Partial<
  Pick<
    Metric,
    'weightKg' | 'heightCm' | 'bodyFatPercentage' | 'muscleMassKg' | 'notes' | 'recordedAt'
  >
>;

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Metric)
    private readonly metricsRepository: Repository<Metric>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async createForStudent(
    studentId: number,
    professionalId: number,
    data: CreateMetricData,
  ): Promise<Metric> {
    const metricData = this.normalizeMetricData(data, true);
    await findProfessionalStudentOrFail(this.studentsRepository, studentId, professionalId);

    const metric = this.metricsRepository.create({
      ...metricData,
      recordedAt: metricData.recordedAt ?? new Date(),
      studentId,
      professionalId,
    });

    return this.metricsRepository.save(metric);
  }

  async findAllForProfessional(professionalId: number): Promise<Metric[]> {
    return this.metricsRepository.find({
      where: {
        professionalId,
      },
      order: {
        recordedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findByStudentForProfessional(
    studentId: number,
    professionalId: number,
  ): Promise<Metric[]> {
    await findProfessionalStudentOrFail(this.studentsRepository, studentId, professionalId);

    return this.metricsRepository.find({
      where: {
        studentId,
        professionalId,
      },
      order: {
        recordedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async updateForStudent(
    studentId: number,
    metricId: number,
    professionalId: number,
    data: UpdateMetricData,
  ): Promise<Metric> {
    const metricData = this.normalizeMetricData(data, false);
    const metric = await this.metricsRepository.findOne({
      where: {
        id: metricId,
        studentId,
        professionalId,
      },
    });

    if (!metric) {
      throw new NotFoundException('Metrica nao encontrada');
    }

    Object.assign(metric, metricData);

    return this.metricsRepository.save(metric);
  }

  async removeForStudent(
    studentId: number,
    metricId: number,
    professionalId: number,
  ): Promise<void> {
    const result = await this.metricsRepository.delete({
      id: metricId,
      studentId,
      professionalId,
    });

    if (!result.affected) {
      throw new NotFoundException('Metrica nao encontrada');
    }
  }

  async findForStudentUser(userId: number): Promise<Metric[]> {
    const students = await this.studentsRepository.find({
      where: {
        userId,
      },
    });

    if (students.length === 0) {
      throw new NotFoundException('Aluno vinculado ao usuario nao encontrado');
    }

    const studentIds = students.map((student) => student.id);

    return this.metricsRepository.find({
      where: {
        studentId: In(studentIds),
      },
      order: {
        recordedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  private normalizeMetricData(
    data: CreateMetricData | UpdateMetricData,
    requireMetricValue: boolean,
  ): NormalizedMetricData {
    const payload = this.getPayloadObject(data);
    const metricData: NormalizedMetricData = {
      ...this.normalizeWeightKg(payload.weightKg),
      ...this.normalizeHeightCm(payload.heightCm),
      ...this.normalizeBodyFatPercentage(payload.bodyFatPercentage),
      ...this.normalizeMuscleMassKg(payload.muscleMassKg),
      ...this.normalizeNotes(payload.notes),
      ...this.normalizeRecordedAt(payload.recordedAt),
    };

    if (Object.keys(metricData).length === 0) {
      throw new BadRequestException('Informe ao menos um campo de metrica');
    }

    if (requireMetricValue && !this.hasMetricValue(metricData)) {
      throw new BadRequestException('Informe ao menos uma metrica corporal');
    }

    return metricData;
  }

  private getPayloadObject(data: CreateMetricData | UpdateMetricData): Record<string, unknown> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Payload de metricas invalido');
    }

    return data as Record<string, unknown>;
  }

  private normalizeWeightKg(value: unknown): Pick<NormalizedMetricData, 'weightKg'> {
    return this.normalizeNullablePositiveNumber(
      value,
      'weightKg',
      'Peso deve ser um numero positivo',
    );
  }

  private normalizeHeightCm(value: unknown): Pick<NormalizedMetricData, 'heightCm'> {
    return this.normalizeNullablePositiveNumber(
      value,
      'heightCm',
      'Altura deve ser um numero positivo',
    );
  }

  private normalizeBodyFatPercentage(
    value: unknown,
  ): Pick<NormalizedMetricData, 'bodyFatPercentage'> {
    return this.normalizeNullableNumberInRange(
      value,
      'bodyFatPercentage',
      'Percentual de gordura deve estar entre 0 e 100',
      0,
      100,
    );
  }

  private normalizeMuscleMassKg(value: unknown): Pick<NormalizedMetricData, 'muscleMassKg'> {
    return this.normalizeNullablePositiveNumber(
      value,
      'muscleMassKg',
      'Massa muscular deve ser um numero positivo',
    );
  }

  private normalizeNotes(value: unknown): Pick<NormalizedMetricData, 'notes'> {
    if (value === undefined) {
      return {};
    }

    if (value === null) {
      return { notes: null };
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Observacoes da metrica invalidas');
    }

    return { notes: value.trim() || null };
  }

  private normalizeRecordedAt(value: unknown): Pick<NormalizedMetricData, 'recordedAt'> {
    if (value === undefined) {
      return {};
    }

    if (value === null || value === '') {
      throw new BadRequestException('Data da metrica invalida');
    }

    if (!(typeof value === 'string' || value instanceof Date)) {
      throw new BadRequestException('Data da metrica invalida');
    }

    const recordedAt = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(recordedAt.getTime())) {
      throw new BadRequestException('Data da metrica invalida');
    }

    return { recordedAt };
  }

  private normalizeNullablePositiveNumber<K extends keyof NormalizedMetricData>(
    value: unknown,
    field: K,
    errorMessage: string,
  ): Pick<NormalizedMetricData, K> {
    return this.normalizeNullableNumberInRange(value, field, errorMessage, 0, undefined, true);
  }

  private normalizeNullableNumberInRange<K extends keyof NormalizedMetricData>(
    value: unknown,
    field: K,
    errorMessage: string,
    minimum: number,
    maximum?: number,
    exclusiveMinimum = false,
  ): Pick<NormalizedMetricData, K> {
    if (value === undefined) {
      return {} as Pick<NormalizedMetricData, K>;
    }

    if (value === null) {
      return { [field]: null } as Pick<NormalizedMetricData, K>;
    }

    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      (exclusiveMinimum ? value <= minimum : value < minimum) ||
      (maximum !== undefined && value > maximum)
    ) {
      throw new BadRequestException(errorMessage);
    }

    return { [field]: value } as Pick<NormalizedMetricData, K>;
  }

  private hasMetricValue(metricData: NormalizedMetricData): boolean {
    return [
      metricData.weightKg,
      metricData.heightCm,
      metricData.bodyFatPercentage,
      metricData.muscleMassKg,
    ].some((value) => value !== undefined && value !== null);
  }

}
