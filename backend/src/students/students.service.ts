import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async create(data: Partial<Student>): Promise<Student> {
    const student = this.studentsRepository.create(data);
    return this.studentsRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find();
  }

  async update(id: number, data: Partial<Student>): Promise<Student> {
    const student = await this.studentsRepository.preload({
      ...data,
      id,
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return this.studentsRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    await this.studentsRepository.delete(id);
  }
}
