import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '../users/entities/user.entity';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() body: Partial<Student>, @Req() request: AuthenticatedRequest) {
    return this.studentsService.create(body, this.getProfessionalId(request));
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.studentsService.findAll(this.getProfessionalId(request));
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Student>,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.studentsService.update(id, body, this.getProfessionalId(request));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.studentsService.remove(id, this.getProfessionalId(request));
  }

  private getProfessionalId(request: AuthenticatedRequest): number {
    if (request.user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Apenas profissionais podem gerenciar alunos');
    }

    return request.user.sub;
  }
}
