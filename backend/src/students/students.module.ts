import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, User]), AuthModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
