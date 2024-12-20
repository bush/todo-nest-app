import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Callback, Context, Handler } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';

// Note: To build with this file instead of src/main.ts,
// change the entryFile property in nest-cli.json to "main-sls"

let server: Handler;
async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug'],
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  Logger.log(`Application Starting: ${process.env.NODE_ENV}`, 'Bootstrap');
  server = server ?? (await bootstrap());
  return server(event,  context, callback);
};