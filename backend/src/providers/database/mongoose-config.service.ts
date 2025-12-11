import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createTransactionConnectionFactory } from 'nestjs-mongo-transactions';

import { AllConfigType } from '@/common/configs/config.type';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createMongooseOptions(): MongooseModuleOptions {
    const options: MongooseModuleOptions = {
      uri: this.configService.get('database.url', { infer: true }),
      dbName: this.configService.get('database.name', { infer: true }),
      user: this.configService.get('database.username', { infer: true }),
      pass: this.configService.get('database.password', { infer: true }),
      connectionFactory(connection) {
        connection.plugin(mongooseAutoPopulate);
        connection.plugin(createTransactionConnectionFactory());
        return connection;
      },
    };

    if (options.uri?.includes('mongodb+srv://')) {
      delete options.dbName;
      delete options.user;
      delete options.pass;
      return options;
    }

    return options;
  }
}

@Injectable()
export class MongooseConfigTestService implements MongooseOptionsFactory {
  async createMongooseOptions(): Promise<MongooseModuleOptions> {
    const mongoServer = await MongoMemoryServer.create({
      instance: { port: 27017 },
    });

    return {
      uri: mongoServer.getUri(),
      connectionFactory(connection) {
        connection.plugin(mongooseAutoPopulate);
        connection.plugin(createTransactionConnectionFactory());
        return connection;
      },
    };
  }
}
