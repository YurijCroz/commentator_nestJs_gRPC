import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import * as dotenv from 'dotenv';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'commentator', // name package proto file
      protoPath: join(__dirname, 'protos/commentator.proto'),
      url: 'localhost:4000',
    },
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api/swagger', app, document);

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
