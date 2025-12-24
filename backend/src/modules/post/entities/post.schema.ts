import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { UserSchemaClass } from '@/modules/user/entities/user.chema';
import { FileSchemaClass } from '@/modules/file/entities/file.schema';
import EntityDocumentHelper from '@/common/utils/document-entity';
import paginate from 'mongoose-paginate-v2';
import { TagSchemaClass } from '@/modules/tag/entities/tag.schema';

@Schema({
  collection: 'posts',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class PostSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({
    type: FileSchemaClass,
  })
  banner: FileSchemaClass | null;

  @Prop({
    type: [Types.ObjectId],
    ref: TagSchemaClass.name,
    maximum: 10,
  })
  tags?: TagSchemaClass[];

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({ type: Boolean, default: false })
  draft?: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: UserSchemaClass.name,
    required: true,
  })
  author: UserSchemaClass;

  @Prop({
    type: Number,
    default: 0,
  })
  viewCount: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(PostSchemaClass);

export type PostDocument = HydratedDocument<PostSchemaClass>;

PostSchema.plugin(paginate);

PostSchema.index({ author: 1 });
