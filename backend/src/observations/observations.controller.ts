import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '../users/entities/user.entity';
import { ObservationsService } from './observations.service';
import type { CreateObservationData } from './observations.service';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller()
@UseGuards(JwtAuthGuard)
export class ObservationsController {
  constructor(private readonly observationsService: ObservationsService) {}

  @Post('students/:studentId/observations')
  createForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: CreateObservationData,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.observationsService.createForStudent(
      studentId,
      this.getProfessionalId(request),
      body,
    );
  }

  @Get('students/:studentId/observations')
  findByStudentForProfessional(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.observationsService.findByStudentForProfessional(
      studentId,
      this.getProfessionalId(request),
    );
  }

  @Get('observations/me')
  findForCurrentStudent(@Req() request: AuthenticatedRequest) {
    if (request.user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Apenas alunos podem visualizar suas observacoes');
    }

    return this.observationsService.findForStudentUser(request.user.sub);
  }

  private getProfessionalId(request: AuthenticatedRequest): number {
    if (request.user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Apenas profissionais podem gerenciar observacoes');
    }

    return request.user.sub;
  }
}
