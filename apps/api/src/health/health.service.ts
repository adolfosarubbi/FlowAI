import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponseDto, HealthStatus } from './health.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResponseDto> {
    const database = await this.checkDatabase();

    const overallStatus: HealthStatus = database.status === 'ok' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database,
    };
  }

  private async checkDatabase(): Promise<{ status: HealthStatus; error?: string }> {
    try {
      // Use a raw scalar query to verify connectivity without touching domain tables
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      // Log internally but do not surface connection details to the caller
      this.logger.warn(`Database health check failed: ${message}`);
      return { status: 'error', error: 'Database unreachable' };
    }
  }
}
