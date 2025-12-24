import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema, CommentSchemaClass } from './entities/comment.schema';

@Module({
  imports: [
    // import modules, etc.
    MongooseModule.forFeature([
      {
        name: CommentSchemaClass.name,
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [CommentService, CommentRepository],
  exports: [CommentService],
})
export class CommentModule {}
