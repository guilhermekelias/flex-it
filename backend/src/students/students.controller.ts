import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() body: Partial<Student>) {
    return this.studentsService.create(body);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<Student>) {
    return this.studentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}
