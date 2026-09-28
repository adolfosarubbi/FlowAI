import { vi, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      $queryRaw: vi.fn(),
    } as unknown as Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return ok status when database query succeeds', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.database.status).toBe('ok');
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should return degraded status when database query fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

    const result = await service.check();

    expect(result.status).toBe('degraded');
    expect(result.database.status).toBe('error');
    // Should not expose internal connection details
    expect(result.database.error).toBe('Database unreachable');
    expect(result.database.error).not.toContain('Connection refused');
  });
});
