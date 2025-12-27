import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserSchemaClass } from './entities/user.chema';
import { User } from './domain/user';
import { UserMapper } from './mappers/user.mapper';
import { NullableType } from '@/common/types/nullable.type';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserSchemaClass>,
  ) {}

  async create(data: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(data);
    const createdUser = new this.userModel(persistenceModel);
    const userObject = await createdUser.save();
    return UserMapper.toDomain(userObject);
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null;

    const userObject = await this.userModel.findOne({ email });
    return userObject ? UserMapper.toDomain(userObject) : null;
  }

  async findByUsername(
    username: User['username'],
  ): Promise<NullableType<User>> {
    if (!username) return null;

    const userObject = await this.userModel.findOne({ username });
    return userObject ? UserMapper.toDomain(userObject) : null;
  }
}
