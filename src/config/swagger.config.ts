import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('commentator NestJS')
  .setDescription('Documentation REST API')
  .setVersion('0.1.0')
  .addTag('REST API')
  .addBearerAuth()
  .build();
