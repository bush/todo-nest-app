
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });
  app.useGlobalPipes(new ValidationPipe());
  Logger.log(`NODE_ENV: ${process.env.NODE_ENV}`, "Main");
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();