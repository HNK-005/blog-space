import { UserModule } from './modules/user/user.module';
import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { PlaygroundModule } from './modules/playground/playground.module';
import { APP_ENVIRONMENT } from './common/constants/app.enum';
import { LoggerModule } from 'nestjs-pino';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MongooseConfigService,
  MongooseConfigTestService,
} from './providers/database/mongoose-config.service';

import appConfig from './common/configs/app.config';
import databaseConfig from './providers/database/config/database.config';
import fileConfig from './modules/file/config/file.config';
import mailConfig from './providers/mail/config/mail.config';

import { FileModule } from './modules/file/file.module';
import { PostModule } from './modules/post/post.module';
import { TagModule } from './modules/tag/tag.module';
import { FollowModule } from './modules/follow/follow.module';
import { MailerModule } from './modules/mailer/mailer.module';
import authConfig from './modules/auth/config/auth.config';
import { AuthModule } from './modules/auth/auth.module';
import { SessionModule } from './modules/session/session.module';

const getLoggerConfig = () => {
  const isProduction = process.env.NODE_ENV === APP_ENVIRONMENT.PRODUCTION;

  return {
    pinoHttp: {
      level: isProduction ? 'info' : 'debug',
      transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: false,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
    },
  };
};

const getMongooseConfigClass = () => {
  return process.env.NODE_ENV === APP_ENVIRONMENT.TEST
    ? MongooseConfigTestService
    : MongooseConfigService;
};

const getDevModules = () => {
  return process.env.NODE_ENV === APP_ENVIRONMENT.DEVELOPMENT
    ? [PlaygroundModule]
    : [];
};

@Module({
  imports: [
    LoggerModule.forRoot(getLoggerConfig()),

    MongooseModule.forRootAsync({
      useClass: getMongooseConfigClass(),
    }),

    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, fileConfig, mailConfig, authConfig],
      isGlobal: true,
    }),

    ...getDevModules(),

    FileModule,
    UserModule,
    PostModule,
    TagModule,
    FollowModule,
    MailerModule,
    AuthModule,
    SessionModule,
  ],
})
export class AppModule {}
