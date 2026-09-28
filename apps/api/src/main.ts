import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FlowAI API')
    .setDescription('AI-powered WhatsApp lead qualification and follow-up platform')
    .setVersion('1.0')
    .addTag('health', 'Service health and readiness checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);

  console.log(`FlowAI API running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

void bootstrap();
