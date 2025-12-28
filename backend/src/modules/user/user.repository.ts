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

  async findById(id: User['id']): Promise<NullableType<User>> {
    const userObject = await this.userModel.findById(id);
    return userObject ? UserMapper.toDomain(userObject) : null;
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

  async update(id: User['id'], payload: Partial<User>): Promise<User | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id };
    const user = await this.userModel.findOne(filter);

    if (!user) {
      return null;
    }

    const userObject = await this.userModel.findOneAndUpdate(
      filter,
      UserMapper.toPersistence({
        ...UserMapper.toDomain(user),
        ...clonedPayload,
      }),
      { new: true },
    );

    return userObject ? UserMapper.toDomain(userObject) : null;
  }
}
