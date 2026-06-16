import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Raw, Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { User, UserRole } from './entities/user.entity';

export type CreateUserData = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
};

type NormalizedCreateUserData = Pick<User, 'name' | 'email' | 'password' | 'role'>;

type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: CreateUserData): Promise<PublicUser> {
    const userData = this.normalizeCreateUserData(data);
    const existingUser = await this.findByEmail(userData.email);

    if (existingUser) {
      throw new ConflictException('Ja existe uma conta com este e-mail');
    }

    const user = this.usersRepository.create(userData);
    const savedUser = await this.saveUserOrThrowConflict(user);

    await this.linkPendingStudentsToUser(savedUser);

    return this.toPublicUser(savedUser);
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.toPublicUser(user));
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = this.normalizeEmail(email);

    if (!normalizedEmail) {
      return null;
    }

    return this.usersRepository.findOne({
      where: {
        email: Raw((alias) => `LOWER(TRIM(${alias})) = :email`, {
          email: normalizedEmail,
        }),
      },
    });
  }

  async login(email: string, password: string) {
    const user = typeof email === 'string' ? await this.findByEmail(email) : null;

    if (!user) {
      return { message: 'Usuário não encontrado' };
    }

    if (typeof password !== 'string' || user.password !== password) {
      return { message: 'Senha inválida' };
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login realizado com sucesso',
      user: this.toPublicUser(user),
      accessToken,
    };
  }

  private normalizeCreateUserData(data: CreateUserData): NormalizedCreateUserData {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Dados de cadastro invalidos');
    }

    return {
      name: this.normalizeRequiredText(data.name, 'Nome e obrigatorio'),
      email: this.normalizeEmailField(data.email),
      password: this.normalizeRequiredText(data.password, 'Senha e obrigatoria'),
      role: this.normalizeRole(data.role),
    };
  }

  private normalizeRequiredText(value: unknown, errorMessage: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(errorMessage);
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(errorMessage);
    }

    return normalizedValue;
  }

  private normalizeEmailField(value: unknown): string {
    const normalizedEmail = this.normalizeRequiredText(value, 'E-mail e obrigatorio').toLowerCase();

    if (!this.isValidEmail(normalizedEmail)) {
      throw new BadRequestException('E-mail invalido');
    }

    return normalizedEmail;
  }

  private normalizeRole(role: unknown): UserRole {
    if (role === UserRole.PROFESSIONAL || role === UserRole.STUDENT) {
      return role;
    }

    throw new BadRequestException('Perfil de usuario invalido. Use professional ou student');
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private async saveUserOrThrowConflict(user: User): Promise<User> {
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Ja existe uma conta com este e-mail');
      }

      throw error;
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    );
  }

  private async linkPendingStudentsToUser(user: User): Promise<void> {
    if (user.role !== UserRole.STUDENT) {
      return;
    }

    const pendingStudents = await this.studentsRepository.find({
      where: {
        userId: IsNull(),
        email: Raw((alias) => `LOWER(TRIM(${alias})) = :email`, {
          email: user.email,
        }),
      },
    });

    if (pendingStudents.length === 0) {
      return;
    }

    pendingStudents.forEach((student) => {
      student.userId = user.id;
    });

    await this.studentsRepository.save(pendingStudents);
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
