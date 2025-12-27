import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import EntityDocumentHelper from '@/common/utils/document-entity';
import { FileSchemaClass } from '@/modules/file/entities/file.schema';
import { AuthProvidersEnum } from '@/modules/auth/auth.enum';
import { RoleEnum, StatusEnum } from '../user.enum';

@Schema({
  collection: 'users',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class UserSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, maxlength: 100 })
  fullName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({ type: String })
  newEmail?: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String })
  password?: string;

  @Prop({ type: String, maxlength: 200 })
  bio?: string;

  @Prop({ type: Number, default: 0 })
  postCount: number;

  @Prop({ type: Number, default: 0 })
  commentCount: number;

  @Prop({ type: Number, default: 0 })
  followerCount: number;

  @Prop({ type: Number, default: 0 })
  followingCount: number;

  @Prop({
    type: FileSchemaClass,
  })
  avatar?: FileSchemaClass | null;

  @Prop({
    type: String,
    enum: AuthProvidersEnum,
    default: AuthProvidersEnum.EMAIL,
    required: true,
  })
  provider: AuthProvidersEnum;

  @Prop({
    type: String,
    enum: RoleEnum,
    default: RoleEnum.USER,
    required: true,
  })
  role: RoleEnum;

  @Prop({
    type: String,
    enum: StatusEnum,
    default: StatusEnum.INACTIVE,
    required: true,
  })
  status: StatusEnum;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
export type UserSchemaDocument = HydratedDocument<UserSchemaClass>;

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
