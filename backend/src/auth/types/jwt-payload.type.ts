import type { UserRole } from '../../users/entities/user.entity';

export type JwtPayload = {
  sub: number;
  email: string;
  role: UserRole;
};
