import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const register = vi.fn();
  const login = vi.fn();

  const authServiceMock = {
    register,
    login,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate registration to AuthService', async () => {
    const dto: RegisterDto = {
      email: 'admin@example.com',
      password: 'SecurePassword123!',
      firstName: 'Adolfo',
      lastName: 'Sarubbi',
      workspaceName: 'My Company',
    };

    const expectedResult = {
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        firstName: 'Adolfo',
        lastName: 'Sarubbi',
      },
      workspace: {
        id: 'workspace-1',
        name: 'My Company',
        slug: 'my-company',
      },
      membership: {
        role: 'ADMIN',
      },
    };

    register.mockResolvedValue(expectedResult);

    const result = await controller.register(dto);

    expect(register).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });

  it('should delegate login to AuthService', async () => {
    const dto: LoginDto = {
      email: 'admin@example.com',
      password: 'SecurePassword123!',
    };

    const expectedResult = {
      accessToken: 'signed-access-token',
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        firstName: 'Adolfo',
        lastName: 'Sarubbi',
      },
      memberships: [
        {
          workspace: {
            id: 'workspace-1',
            name: 'My Company',
            slug: 'my-company',
          },
          role: 'ADMIN',
        },
      ],
    };

    login.mockResolvedValue(expectedResult);

    const result = await controller.login(dto);

    expect(login).toHaveBeenCalledOnce();
    expect(login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });
});
