import { vi, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: Mocked<HealthService>;

  beforeEach(async () => {
    const mockHealthService: Partial<Mocked<HealthService>> = {
      check: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: mockHealthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health response when database is ok', async () => {
    const mockResponse = {
      status: 'ok' as const,
      timestamp: '2024-01-01T00:00:00.000Z',
      version: '1.0.0',
      database: { status: 'ok' as const },
    };
    healthService.check.mockResolvedValue(mockResponse);

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.database.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
    expect(result.version).toBeDefined();
  });

  it('should return degraded status when database is down', async () => {
    const mockResponse = {
      status: 'degraded' as const,
      timestamp: '2024-01-01T00:00:00.000Z',
      version: '1.0.0',
      database: { status: 'error' as const, error: 'Database unreachable' },
    };
    healthService.check.mockResolvedValue(mockResponse);

    const result = await controller.check();

    expect(result.status).toBe('degraded');
    expect(result.database.status).toBe('error');
    // Must not leak connection strings or secrets
    expect(result.database.error).not.toContain('postgresql://');
    expect(result.database.error).not.toContain('password');
  });
});
