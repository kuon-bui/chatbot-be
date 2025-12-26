import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import mongoose from 'mongoose';

async function bootstrap() {
  var appOptions: NestApplicationOptions = {
    cors: {
      origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || '*',
      methods: process.env.CORS_ALLOWED_METHODS?.split(',') || 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      optionsSuccessStatus: 204,
      preflightContinue: false,
    },
  };

  const app = await NestFactory.create(AppModule, appOptions,);

  if (process.env.DEBUG === 'true') {
    mongoose.set('debug', true);
  }

  const config = new DocumentBuilder()
    .setTitle('Chatbot API')
    .setDescription('API documentation for Chatbot Backend Service')
    .setVersion('1.0')
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
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Channels', 'Channel management endpoints')
    .addTag('Messages', 'Message management endpoints')
    .addTag('Tokens', 'API token management endpoints')
    .addTag('AI', 'AI-powered chat and translation endpoints')
    .addTag('WebSocket', 'Real-time chat via WebSocket (ws://localhost:3000/ws)')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const document = documentFactory();
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
