import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

export async function findProfessionalStudentOrFail(
  studentsRepository: Repository<Student>,
  studentId: number,
  professionalId: number,
): Promise<Student> {
  const student = await studentsRepository.findOne({
    where: {
      id: studentId,
      professionalId,
    },
  });

  if (!student) {
    throw new NotFoundException('Aluno nao encontrado');
  }

  return student;
}
