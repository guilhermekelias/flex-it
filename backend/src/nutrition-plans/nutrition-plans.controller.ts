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
import { NutritionPlansService } from './nutrition-plans.service';
import type {
  CreateNutritionPlanData,
  UpdateNutritionPlanData,
} from './nutrition-plans.service';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller()
@UseGuards(JwtAuthGuard)
export class NutritionPlansController {
  constructor(private readonly nutritionPlansService: NutritionPlansService) {}

  @Get('nutrition-plans')
  findAllForProfessional(@Req() request: AuthenticatedRequest) {
    return this.nutritionPlansService.findAllForProfessional(this.getProfessionalId(request));
  }

  @Post('students/:studentId/nutrition-plans')
  createForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: CreateNutritionPlanData,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.nutritionPlansService.createForStudent(
      studentId,
      this.getProfessionalId(request),
      body,
    );
  }

  @Get('students/:studentId/nutrition-plans')
  findByStudentForProfessional(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.nutritionPlansService.findByStudentForProfessional(
      studentId,
      this.getProfessionalId(request),
    );
  }

  @Put('students/:studentId/nutrition-plans/:nutritionPlanId')
  updateForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('nutritionPlanId', ParseIntPipe) nutritionPlanId: number,
    @Body() body: UpdateNutritionPlanData,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.nutritionPlansService.updateForStudent(
      studentId,
      nutritionPlanId,
      this.getProfessionalId(request),
      body,
    );
  }

  @Delete('students/:studentId/nutrition-plans/:nutritionPlanId')
  removeForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('nutritionPlanId', ParseIntPipe) nutritionPlanId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.nutritionPlansService.removeForStudent(
      studentId,
      nutritionPlanId,
      this.getProfessionalId(request),
    );
  }

  @Get('nutrition-plans/me')
  findForCurrentStudent(@Req() request: AuthenticatedRequest) {
    if (request.user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Apenas alunos podem visualizar seus planos alimentares');
    }

    return this.nutritionPlansService.findForStudentUser(request.user.sub);
  }

  private getProfessionalId(request: AuthenticatedRequest): number {
    if (request.user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Apenas profissionais podem gerenciar planos alimentares');
    }

    return request.user.sub;
  }
}
