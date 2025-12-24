import EntityDocumentHelper from '@/common/utils/document-entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'tags',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class TagSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const TagSchema = SchemaFactory.createForClass(TagSchemaClass);
export type TagSchemaDocument = HydratedDocument<TagSchemaClass>;
