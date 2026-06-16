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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '../users/entities/user.entity';
import { WorkoutsService } from './workouts.service';
import type { CreateWorkoutData, UpdateWorkoutData } from './workouts.service';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller()
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get('workouts')
  findAllForProfessional(@Req() request: AuthenticatedRequest) {
    return this.workoutsService.findAllForProfessional(this.getProfessionalId(request));
  }

  @Post('students/:studentId/workouts')
  createForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: CreateWorkoutData,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workoutsService.createForStudent(
      studentId,
      this.getProfessionalId(request),
      body,
    );
  }

  @Get('students/:studentId/workouts')
  findByStudentForProfessional(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workoutsService.findByStudentForProfessional(
      studentId,
      this.getProfessionalId(request),
    );
  }

  @Put('students/:studentId/workouts/:workoutId')
  updateForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Body() body: UpdateWorkoutData,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workoutsService.updateForStudent(
      studentId,
      workoutId,
      this.getProfessionalId(request),
      body,
    );
  }

  @Delete('students/:studentId/workouts/:workoutId')
  removeForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workoutsService.removeForStudent(
      studentId,
      workoutId,
      this.getProfessionalId(request),
    );
  }

  @Get('workouts/me')
  findForCurrentStudent(@Req() request: AuthenticatedRequest) {
    if (request.user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Apenas alunos podem visualizar seus treinos');
    }

    return this.workoutsService.findForStudentUser(request.user.sub);
  }

  private getProfessionalId(request: AuthenticatedRequest): number {
    if (request.user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Apenas profissionais podem gerenciar treinos');
    }

    return request.user.sub;
  }
}
