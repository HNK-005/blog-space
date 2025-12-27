import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import EntityDocumentHelper from '@/common/utils/document-entity';
import { FileStatusEnum } from '../file.enum';

@Schema({
  collection: 'files',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class FileSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
  })
  path: string;

  @Prop({
    type: String,
    enum: FileStatusEnum,
    default: FileStatusEnum.UPLOADED,
  })
  status: FileStatusEnum;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const FileSchema = SchemaFactory.createForClass(FileSchemaClass);
export type FileSchemaDocument = HydratedDocument<FileSchemaClass>;

FileSchema.index({ status: 1 });
