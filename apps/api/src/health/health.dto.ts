import { ApiProperty } from '@nestjs/swagger';

export type HealthStatus = 'ok' | 'degraded' | 'error';

export class DatabaseHealthDto {
  @ApiProperty({ enum: ['ok', 'error'], description: 'Database connectivity status' })
  status!: HealthStatus;

  @ApiProperty({ required: false, description: 'Error message if status is error' })
  error?: string;
}

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok', 'degraded', 'error'], description: 'Overall API health status' })
  status!: HealthStatus;

  @ApiProperty({ description: 'ISO 8601 UTC timestamp' })
  timestamp!: string;

  @ApiProperty({ description: 'API version' })
  version!: string;

  @ApiProperty({ type: DatabaseHealthDto })
  database!: DatabaseHealthDto;
}
