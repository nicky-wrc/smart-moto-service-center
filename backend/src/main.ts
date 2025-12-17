import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. ตั้งค่า Global Prefix (ทุก API จะนำหน้าด้วย /api)
  app.setGlobalPrefix('api');

  // 2. เปิดใช้ ValidationPipe (ตรวจสอบข้อมูล DTO อัตโนมัติ)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 3. Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. เปิด CORS (สำคัญมาก! เพื่อให้ Frontend React เรียกใช้ API ได้)
  app.enableCors();

  // 5. ตั้งค่า Swagger
  const config = new DocumentBuilder()
    .setTitle('Smart Moto Service Center API')
    .setDescription('API contract for Smart Moto Service Center')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 4000);
  console.log(`API: http://localhost:${process.env.PORT ?? 4000}/api`);
  console.log(`Swagger: http://localhost:${process.env.PORT ?? 4000}/docs`);
}
bootstrap();
