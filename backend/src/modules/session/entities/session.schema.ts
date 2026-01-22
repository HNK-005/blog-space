import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import { UserSchemaClass } from '../../user/entities/user.chema';
import EntityDocumentHelper from '@/common/utils/document-entity';

export type SessionSchemaDocument = HydratedDocument<SessionSchemaClass>;

@Schema({
  collection: 'sessions',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class SessionSchemaClass extends EntityDocumentHelper {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSchemaClass' })
  user: UserSchemaClass;

  @Prop()
  hash: string;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(SessionSchemaClass);

SessionSchema.index({ user: 1 });
