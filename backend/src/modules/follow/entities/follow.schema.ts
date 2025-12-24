import EntityDocumentHelper from '@/common/utils/document-entity';
import { UserSchemaClass } from '@/modules/user/entities/user.chema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'follows',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class FollowSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  follower: UserSchemaClass;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  following: UserSchemaClass;

  @Prop({ type: Date })
  createdAt: Date;
  @Prop({ type: Date })
  updatedAt: Date;
  @Prop({ type: Date })
  deletedAt?: Date;
}

export const FollowSchema = SchemaFactory.createForClass(FollowSchemaClass);
export type FollowDocument = HydratedDocument<FollowSchemaClass>;

FollowSchema.index({ following: 1 });
FollowSchema.index({ follower: 1 });
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
