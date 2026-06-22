import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Raw, Repository } from 'typeorm';
import {
  normalizeEmail,
  normalizeEmailField,
  normalizeRequiredText,
} from '../common/validation/text-normalizers';
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

const INVALID_PASSWORD_MESSAGE =
  'A senha deve ter no mínimo 8 caracteres, incluindo letras, números e caracteres especiais.';

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /\p{L}/u.test(password) &&
    /\p{N}/u.test(password) &&
    /[^\p{L}\p{N}\s]/u.test(password)
  );
}

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
    const normalizedEmail = normalizeEmail(email);

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

    const name = normalizeRequiredText(data.name, 'Nome e obrigatorio');
    const email = normalizeEmailField(data.email, 'E-mail e obrigatorio', 'E-mail invalido');
    const password = normalizeRequiredText(data.password, 'Senha e obrigatoria');

    if (!isStrongPassword(password)) {
      throw new BadRequestException(INVALID_PASSWORD_MESSAGE);
    }

    return {
      name,
      email,
      password,
      role: this.normalizeRole(data.role),
    };
  }

  private normalizeRole(role: unknown): UserRole {
    if (role === UserRole.PROFESSIONAL || role === UserRole.STUDENT) {
      return role;
    }

    throw new BadRequestException('Perfil de usuario invalido. Use professional ou student');
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
