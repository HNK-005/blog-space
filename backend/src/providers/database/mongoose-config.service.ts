import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { AllConfigType } from '@/common/configs/config.type';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { createTransactionConnectionFactory } from 'nestjs-mongo-transactions';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get('database.url', { infer: true }),
      connectionFactory(connection) {
        connection.plugin(mongooseAutoPopulate);
        connection.plugin(createTransactionConnectionFactory());
        return connection;
      },
    };
  }
}
