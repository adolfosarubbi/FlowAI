import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
    let service: AuthService;

    const userFindUnique = vi.fn();
    const workspaceFindUnique = vi.fn();
    const transaction = vi.fn();

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

        expect(
            await argon2.verify(userCreateArgs.data.passwordHash, dto.password),
        ).toBe(true);

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

        await expect(service.register(dto)).rejects.toBeInstanceOf(
            ConflictException,
        );

        expect(transaction).not.toHaveBeenCalled();
    });

    it('should generate a unique workspace slug', async () => {
        userFindUnique.mockResolvedValue(null);

        workspaceFindUnique
            .mockResolvedValueOnce({ id: 'workspace-1' })
            .mockResolvedValueOnce(null);

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
});