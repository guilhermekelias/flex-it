import { Body, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import type { CreateUserData } from './users.service';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: CreateUserData) {
    return this.usersService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() request: AuthenticatedRequest) {
    if (request.user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Apenas profissionais podem listar usuarios');
    }

    return this.usersService.findAll();
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.usersService.login(body.email, body.password);
  }
}
