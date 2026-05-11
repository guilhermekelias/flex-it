import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: Partial<User>) {
    const user = this.usersRepository.create(data);
    const savedUser = await this.usersRepository.save(user);

    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async login(email: string, password: string) {
    const user = await this.findByEmail(email);

    if (!user) {
      return { message: 'Usuário não encontrado' };
    }

    if (user.password !== password) {
      return { message: 'Senha inválida' };
    }

    const { password: _, ...userWithoutPassword } = user;
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      accessToken,
    };
  }
}
