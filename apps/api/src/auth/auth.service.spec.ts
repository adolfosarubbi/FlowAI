import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;

  const userFindUnique = vi.fn();
  const workspaceFindUnique = vi.fn();
  const transaction = vi.fn();
  const jwtSignAsync = vi.fn();
  const jwtServiceMock = {
    signAsync: jwtSignAsync,
  };

  const prismaMock = {
    user: {
      findUnique: userFindUnique,
    },
    workspace: {
      findUnique: workspaceFindUnique,
    },
    $transaction: transaction,
  };

  const dto: RegisterDto = {
    email: '  ADOLFO@Example.com ',
    password: 'SecurePassword123!',
    firstName: ' Adolfo ',
    lastName: ' Sarubbi ',
    workspaceName: ' Café del Sol ',
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register the initial admin and workspace', async () => {
    userFindUnique.mockResolvedValue(null);
    workspaceFindUnique.mockResolvedValue(null);

    const userCreate = vi.fn().mockResolvedValue({
      id: 'user-1',
      email: 'adolfo@example.com',
      passwordHash: 'stored-hash',
      firstName: 'Adolfo',
      lastName: 'Sarubbi',
    });

    const workspaceCreate = vi.fn().mockResolvedValue({
      id: 'workspace-1',
      name: 'Café del Sol',
      slug: 'cafe-del-sol',
    });

    const membershipCreate = vi.fn().mockResolvedValue({
      id: 'membership-1',
      userId: 'user-1',
      workspaceId: 'workspace-1',
      role: Role.ADMIN,
    });

    const tx = {
      user: {
        create: userCreate,
      },
      workspace: {
        create: workspaceCreate,
      },
      membership: {
        create: membershipCreate,
      },
    };

    transaction.mockImplementation(async (callback) => {
      return callback(tx);
    });

    const result = await service.register(dto);

    expect(userCreate).toHaveBeenCalledOnce();

    const userCreateCall = userCreate.mock.calls[0];

    expect(userCreateCall).toBeDefined();

    const userCreateArgs = userCreateCall![0];

    expect(userCreateArgs.data.email).toBe('adolfo@example.com');
    expect(userCreateArgs.data.firstName).toBe('Adolfo');
    expect(userCreateArgs.data.lastName).toBe('Sarubbi');

    expect(userCreateArgs.data.passwordHash).not.toBe(dto.password);

    expect(await argon2.verify(userCreateArgs.data.passwordHash, dto.password)).toBe(true);

    expect(workspaceCreate).toHaveBeenCalledWith({
      data: {
        name: 'Café del Sol',
        slug: 'cafe-del-sol',
      },
    });

    expect(membershipCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        workspaceId: 'workspace-1',
        role: Role.ADMIN,
      },
    });

    expect(result).toEqual({
      user: {
        id: 'user-1',
        email: 'adolfo@example.com',
        firstName: 'Adolfo',
        lastName: 'Sarubbi',
      },
      workspace: {
        id: 'workspace-1',
        name: 'Café del Sol',
        slug: 'cafe-del-sol',
      },
      membership: {
        role: Role.ADMIN,
      },
    });

    expect(result).not.toHaveProperty('passwordHash');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('should reject an already registered email', async () => {
    userFindUnique.mockResolvedValue({
      id: 'existing-user',
    });

    await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);

    expect(transaction).not.toHaveBeenCalled();
  });

  it('should generate a unique workspace slug', async () => {
    userFindUnique.mockResolvedValue(null);

    workspaceFindUnique.mockResolvedValueOnce({ id: 'workspace-1' }).mockResolvedValueOnce(null);

    const userCreate = vi.fn().mockResolvedValue({
      id: 'user-1',
      email: 'adolfo@example.com',
      firstName: 'Adolfo',
      lastName: 'Sarubbi',
    });

    const workspaceCreate = vi.fn().mockResolvedValue({
      id: 'workspace-2',
      name: 'Café del Sol',
      slug: 'cafe-del-sol-2',
    });

    const membershipCreate = vi.fn().mockResolvedValue({
      role: Role.ADMIN,
    });

    const tx = {
      user: {
        create: userCreate,
      },
      workspace: {
        create: workspaceCreate,
      },
      membership: {
        create: membershipCreate,
      },
    };

    transaction.mockImplementation(async (callback) => {
      return callback(tx);
    });

    await service.register(dto);

    expect(workspaceCreate).toHaveBeenCalledWith({
      data: {
        name: 'Café del Sol',
        slug: 'cafe-del-sol-2',
      },
    });
  });

  it('should authenticate a valid user and return an access token', async () => {
    const password = 'SecurePassword123!';
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const loginDto: LoginDto = {
      email: '  ADOLFO@Example.com ',
      password,
    };

    userFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'adolfo@example.com',
      passwordHash,
      firstName: 'Adolfo',
      lastName: 'Sarubbi',
      isActive: true,
      memberships: [
        {
          role: Role.ADMIN,
          workspace: {
            id: 'workspace-1',
            name: 'FlowAI Demo',
            slug: 'flowai-demo',
          },
        },
      ],
    });

    jwtSignAsync.mockResolvedValue('signed-access-token');

    const result = await service.login(loginDto);

    expect(userFindUnique).toHaveBeenCalledWith({
      where: {
        email: 'adolfo@example.com',
      },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    expect(jwtSignAsync).toHaveBeenCalledWith(
      {
        email: 'adolfo@example.com',
      },
      {
        subject: 'user-1',
        expiresIn: '15m',
      },
    );

    expect(result).toEqual({
      accessToken: 'signed-access-token',
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: {
        id: 'user-1',
        email: 'adolfo@example.com',
        firstName: 'Adolfo',
        lastName: 'Sarubbi',
      },
      memberships: [
        {
          workspace: {
            id: 'workspace-1',
            name: 'FlowAI Demo',
            slug: 'flowai-demo',
          },
          role: Role.ADMIN,
        },
      ],
    });

    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('should reject an invalid password without generating a token', async () => {
    const passwordHash = await argon2.hash('CorrectPassword123!', {
      type: argon2.argon2id,
    });

    const loginDto: LoginDto = {
      email: 'adolfo@example.com',
      password: 'WrongPassword123!',
    };

    userFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'adolfo@example.com',
      passwordHash,
      firstName: 'Adolfo',
      lastName: 'Sarubbi',
      isActive: true,
      memberships: [],
    });

    await expect(service.login(loginDto)).rejects.toThrow(
      new UnauthorizedException('Invalid email or password'),
    );

    expect(jwtSignAsync).not.toHaveBeenCalled();
  });

  it('should reject a nonexistent user without generating a token', async () => {
    const loginDto: LoginDto = {
      email: 'unknown@example.com',
      password: 'SecurePassword123!',
    };

    userFindUnique.mockResolvedValue(null);

    await expect(service.login(loginDto)).rejects.toThrow(
      new UnauthorizedException('Invalid email or password'),
    );

    expect(jwtSignAsync).not.toHaveBeenCalled();
  });

  it('should reject an inactive user without generating a token', async () => {
    const loginDto: LoginDto = {
      email: 'adolfo@example.com',
      password: 'SecurePassword123!',
    };

    userFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'adolfo@example.com',
      passwordHash: 'stored-hash',
      firstName: 'Adolfo',
      lastName: 'Sarubbi',
      isActive: false,
      memberships: [],
    });

    await expect(service.login(loginDto)).rejects.toThrow(
      new UnauthorizedException('Invalid email or password'),
    );

    expect(jwtSignAsync).not.toHaveBeenCalled();
  });
});
