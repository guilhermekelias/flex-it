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
import { MetricsService } from './metrics.service';
import type { CreateMetricData, UpdateMetricData } from './metrics.service';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller()
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics')
  findAllForProfessional(@Req() request: AuthenticatedRequest) {
    return this.metricsService.findAllForProfessional(this.getProfessionalId(request));
  }

  @Post('students/:studentId/metrics')
  createForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: CreateMetricData,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.metricsService.createForStudent(studentId, this.getProfessionalId(request), body);
  }

  @Get('students/:studentId/metrics')
  findByStudentForProfessional(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.metricsService.findByStudentForProfessional(
      studentId,
      this.getProfessionalId(request),
    );
  }

  @Put('students/:studentId/metrics/:metricId')
  updateForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('metricId', ParseIntPipe) metricId: number,
    @Body() body: UpdateMetricData,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.metricsService.updateForStudent(
      studentId,
      metricId,
      this.getProfessionalId(request),
      body,
    );
  }

  @Delete('students/:studentId/metrics/:metricId')
  removeForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('metricId', ParseIntPipe) metricId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.metricsService.removeForStudent(
      studentId,
      metricId,
      this.getProfessionalId(request),
    );
  }

  @Get('metrics/me')
  findForCurrentStudent(@Req() request: AuthenticatedRequest) {
    if (request.user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Apenas alunos podem visualizar suas metricas');
    }

    return this.metricsService.findForStudentUser(request.user.sub);
  }

  private getProfessionalId(request: AuthenticatedRequest): number {
    if (request.user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Apenas profissionais podem gerenciar metricas');
    }

    return request.user.sub;
  }
}
