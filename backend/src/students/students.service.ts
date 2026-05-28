import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

type StudentData = Partial<Pick<Student, 'name' | 'email' | 'age' | 'goal'>>;

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async create(data: StudentData, professionalId: number): Promise<Student> {
    const student = this.studentsRepository.create({
      ...this.pickStudentData(data),
      professionalId,
    });

    return this.studentsRepository.save(student);
  }

  async findAll(professionalId: number): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { professionalId },
    });
  }

  async update(id: number, data: StudentData, professionalId: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: {
        id,
        professionalId,
      },
    });

    if (!student) {
      throw new NotFoundException('Aluno nao encontrado');
    }

    Object.assign(student, this.pickStudentData(data));

    return this.studentsRepository.save(student);
  }

  async remove(id: number, professionalId: number): Promise<void> {
    const result = await this.studentsRepository.delete({
      id,
      professionalId,
    });

    if (!result.affected) {
      throw new NotFoundException('Aluno nao encontrado');
    }
  }

  private pickStudentData(data: StudentData): StudentData {
    const studentData: StudentData = {};

    if (data.name !== undefined) {
      studentData.name = data.name;
    }

    if (data.email !== undefined) {
      studentData.email = data.email;
    }

    if (data.age !== undefined) {
      studentData.age = data.age;
    }

    if (data.goal !== undefined) {
      studentData.goal = data.goal;
    }

    return studentData;
  }
}
