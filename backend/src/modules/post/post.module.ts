import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { PostSchema, PostSchemaClass } from './entities/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostSchemaClass.name, schema: PostSchema },
    ]),
  ],
  controllers: [],
  providers: [PostService, PostRepository],
  exports: [PostService],
})
export class PostModule {}
