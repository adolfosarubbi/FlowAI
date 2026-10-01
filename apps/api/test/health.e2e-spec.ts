import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * E2E test for GET /api/v1/health
 *
 * This test spins up the full NestJS application with a mocked PrismaService
 * so it does not require a running database. Integration tests that require
 * a real database will be added in Phase 1.
 */
describe('HealthController (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
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
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    delete process.env.JWT_ACCESS_SECRET;
  });

  describe('GET /api/v1/health', () => {
    it('returns 200 with ok status when database is healthy', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.database.status).toBe('ok');
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(response.body.version).toBeDefined();
    });

    it('returns 200 with degraded status when database is unavailable', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      expect(response.body.status).toBe('degraded');
      expect(response.body.database.status).toBe('error');
    });

    it('does not leak database credentials in the error response', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(
        new Error('Could not connect to postgresql://user:secret@localhost:5432/db'),
      );

      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      const body = JSON.stringify(response.body);
      expect(body).not.toContain('postgresql://');
      expect(body).not.toContain('secret');
      expect(body).not.toContain('password');
    });

    it('response shape matches documented contract', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      expect(response.body).toMatchObject({
        status: expect.stringMatching(/^(ok|degraded|error)$/),
        timestamp: expect.any(String),
        version: expect.any(String),
        database: {
          status: expect.stringMatching(/^(ok|error)$/),
        },
      });
    });
  });
});
