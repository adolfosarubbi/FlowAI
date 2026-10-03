import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: vi.fn(),
    },
    membership: {
      findUnique: vi.fn(),
    },
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'e2e-test-access-secret-not-for-production';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');

    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    delete process.env.JWT_ACCESS_SECRET;
  });

  describe('GET /api/v1/auth/me', () => {
    const activeUser = {
      id: 'user-123',
      email: 'admin@flowai.dev',
      firstName: 'Adolfo',
      lastName: 'Sarubbi',
      isActive: true,
    };

    it('returns 401 when the access token is missing', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);

      expect(response.body.message).toBe('Authentication required');
    });

    it('returns 401 when the access token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Invalid or expired access token');
    });

    it('returns the authenticated user when the access token is valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(activeUser);

      const accessToken = await jwtService.signAsync(
        {
          email: activeUser.email,
        },
        {
          subject: activeUser.id,
          expiresIn: '15m',
        },
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: activeUser.id,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });

      expect(response.body).toEqual({
        user: activeUser,
      });
    });

    it('returns 401 when the authenticated user is inactive', async () => {
      const inactiveUser = {
        ...activeUser,
        isActive: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      const accessToken = await jwtService.signAsync(
        {
          email: inactiveUser.email,
        },
        {
          subject: inactiveUser.id,
          expiresIn: '15m',
        },
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);

      expect(response.body.message).toBe('Invalid or expired access token');
    });
  });

  describe('GET /api/v1/auth/workspace', () => {
    const activeUser = {
      id: 'user-123',
      email: 'admin@flowai.dev',
      firstName: 'Adolfo',
      lastName: 'Sarubbi',
      isActive: true,
    };

    it('returns 400 when X-Workspace-Id is missing', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(activeUser);

      const accessToken = await jwtService.signAsync(
        {
          email: activeUser.email,
        },
        {
          subject: activeUser.id,
          expiresIn: '15m',
        },
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/workspace')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body.message).toBe('X-Workspace-Id header is required');

      expect(mockPrismaService.membership.findUnique).not.toHaveBeenCalled();
    });

    it('returns 403 when the user does not belong to the requested workspace', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(activeUser);
      mockPrismaService.membership.findUnique.mockResolvedValue(null);

      const accessToken = await jwtService.signAsync(
        {
          email: activeUser.email,
        },
        {
          subject: activeUser.id,
          expiresIn: '15m',
        },
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/workspace')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Workspace-Id', 'workspace-other')
        .expect(403);

      expect(response.body.message).toBe('Workspace access denied');

      expect(mockPrismaService.membership.findUnique).toHaveBeenCalledWith({
        where: {
          userId_workspaceId: {
            userId: activeUser.id,
            workspaceId: 'workspace-other',
          },
        },
        include: {
          workspace: true,
        },
      });
    });

    it('returns the workspace context when the user belongs to the requested workspace', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(activeUser);

      mockPrismaService.membership.findUnique.mockResolvedValue({
        id: 'membership-123',
        userId: activeUser.id,
        workspaceId: 'workspace-123',
        role: 'ADMIN',
        workspace: {
          id: 'workspace-123',
          name: 'FlowAI Demo',
          slug: 'flowai-demo',
        },
      });

      const accessToken = await jwtService.signAsync(
        {
          email: activeUser.email,
        },
        {
          subject: activeUser.id,
          expiresIn: '15m',
        },
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/workspace')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Workspace-Id', 'workspace-123')
        .expect(200);

      expect(response.body).toEqual({
        workspace: {
          id: 'workspace-123',
          name: 'FlowAI Demo',
          slug: 'flowai-demo',
          membership: {
            id: 'membership-123',
            role: 'ADMIN',
          },
        },
      });
    });

    it('returns 401 when authentication is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/workspace')
        .set('X-Workspace-Id', 'workspace-123')
        .expect(401);

      expect(response.body.message).toBe('Authentication required');

      expect(mockPrismaService.membership.findUnique).not.toHaveBeenCalled();
    });

    it('returns 403 when the user does not have the required role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(activeUser);

      mockPrismaService.membership.findUnique.mockResolvedValue({
        id: 'membership-123',
        userId: activeUser.id,
        workspaceId: 'workspace-123',
        role: 'AGENT',
        workspace: {
          id: 'workspace-123',
          name: 'FlowAI Demo',
          slug: 'flowai-demo',
        },
      });

      const accessToken = await jwtService.signAsync(
        {
          email: activeUser.email,
        },
        {
          subject: activeUser.id,
          expiresIn: '15m',
        },
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/workspace')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Workspace-Id', 'workspace-123')
        .expect(403);

      expect(response.body.message).toBe('Insufficient permissions');
    });
  });
});
