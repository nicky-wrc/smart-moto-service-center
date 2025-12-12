import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ให้ FE ยิงได้
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  // ทุก route จะขึ้นต้นด้วย /api
  app.setGlobalPrefix('api');

  // Validation กลาง
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Smart Moto Service Center API')
    .setDescription('API contract for Smart Moto Service Center')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document); // /docs

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 4000;

  await app.listen(port);
  console.log(`🚀 API: http://localhost:${port}/api`);
  console.log(`📘 Swagger: http://localhost:${port}/docs`);
}
bootstrap();
