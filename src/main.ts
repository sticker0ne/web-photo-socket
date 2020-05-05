import './config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Logger} from '@nestjs/common';

const { APP_PORT, APP_GLOBAL_PREFIX, APP_ENABLE_CORS } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const enableCors: boolean = JSON.parse(APP_ENABLE_CORS || 'false');

  if (enableCors) {
    app.enableCors();
  }
  await app.listen(Number(APP_PORT) || 3000);

  Logger.log(
    `application started on: ${await app.getUrl()}${
      APP_GLOBAL_PREFIX ? '/' + APP_GLOBAL_PREFIX : ''
    }`,
  );
  Logger.log(`cors is ${enableCors ? 'enabled' : 'disabled'}`);
}

bootstrap();
