import EntityDocumentHelper from '@/common/utils/document-entity';
import { PostSchemaClass } from '@/modules/post/entities/post.schema';
import { UserSchemaClass } from '@/modules/user/entities/user.chema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  collection: 'comments',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class CommentSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  user: UserSchemaClass;

  @Prop({
    type: Types.ObjectId,
    ref: PostSchemaClass.name,
    required: true,
  })
  post: PostSchemaClass;

  @Prop({ type: Types.ObjectId, ref: CommentSchemaClass.name })
  parent?: CommentSchemaClass;

  @Prop({ type: Date })
  createdAt: Date;
  @Prop({ type: Date })
  updatedAt: Date;
  @Prop({ type: Date })
  deletedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(CommentSchemaClass);
export type CommentDocument = HydratedDocument<CommentSchemaClass>;

CommentSchema.index({ post: 1 });
CommentSchema.index({ user: 1 });
CommentSchema.index({ parent: 1 });
