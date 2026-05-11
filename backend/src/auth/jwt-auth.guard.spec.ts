import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';

type MockJwtService = {
  verifyAsync: jest.Mock;
};

type TestRequest = {
  headers: {
    authorization?: string;
  };
  user?: unknown;
};

function createExecutionContext(authorization?: string) {
  const request: TestRequest = {
    headers: authorization ? { authorization } : {},
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;

  return { context, request };
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: MockJwtService;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    };

    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  it('should reject requests without a bearer token', async () => {
    const { context } = createExecutionContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should reject requests with an invalid token', async () => {
    const { context } = createExecutionContext('Bearer invalid-token');
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
  });

  it('should accept requests with a valid token', async () => {
    const payload = {
      sub: 1,
      email: 'patricia@example.com',
      role: UserRole.PROFESSIONAL,
    };
    const { context, request } = createExecutionContext('Bearer valid-token');
    jwtService.verifyAsync.mockResolvedValue(payload);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(payload);
  });
});
