import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { PlaygroundModule } from './src/modules/playground/playground.module';
import appConfig from './common/configs/app.config';
import { APP_ENVIRONMENT } from './common/constants/app.enum';
import { LoggerModule } from 'nestjs-pino';

/* Load PlaygroundModule only in development environment */
const devModules =
  process.env.NODE_ENV === APP_ENVIRONMENT.DEVELOPMENT
    ? [PlaygroundModule]
    : [];

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level:
          process.env.NODE_ENV !== APP_ENVIRONMENT.PRODUCTION
            ? 'debug'
            : 'info',
        transport:
          process.env.NODE_ENV !== APP_ENVIRONMENT.PRODUCTION
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: false,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
      },
    }),
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    ...devModules,
  ],
})
export class AppModule {}
