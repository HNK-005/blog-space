import { json, urlencoded } from 'express';

import { NestApplication, NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

import { Logger } from 'nestjs-pino';

import { useContainer } from 'class-validator';

import { AppModule } from './app.module';

import { AllConfigType } from './common/configs/config.type';
import validationOptions from './common/utils/validation-options';
import ResolvePromisesInterceptor from './common/interceptors/serializer.interceptor';
import LoggingInterceptor from './common/interceptors/logging.interceptor';
import TransformInterceptor from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_ENVIRONMENT } from './common/constants/app.enum';

import setupSwagger from './providers/swagger/setup';

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);
  const env = configService.getOrThrow('app.nodeEnv', { infer: true });
  const logger = app.get(Logger);
  const reflector = app.get(Reflector);

  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
    // https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(reflector),
    new LoggingInterceptor(),
    new TransformInterceptor(reflector),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  if (env !== APP_ENVIRONMENT.PRODUCTION) {
    const { docPrefix } = setupSwagger(app, configService);
    logger.log(
      `Swagger docs available at ${configService.getOrThrow('app.backendDomain', { infer: true })}${docPrefix}`,
    );
  }
  await app.listen(
    configService.getOrThrow('app.port', { infer: true }) || 3000,
  );
}
void bootstrap();
