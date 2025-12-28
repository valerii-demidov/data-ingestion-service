import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // ValidationPipe with forbidNonWhitelisted: false to allow extra.* parameters
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra parameters (extra.* will be handled manually)
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Data Ingestion Service')
    .setDescription('Unified property data from multiple sources')
    .setVersion('1.0')
    .addTag('ingestion', 'Trigger ingestion')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  console.log(`Running on http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api`);
}
void bootstrap();
