import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto } from './health.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns API and database connectivity status. Does not expose secrets or credentials.',
  })
  @ApiOkResponse({
    description: 'API is running (database may be degraded)',
    type: HealthResponseDto,
  })
  async check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}
