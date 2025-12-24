import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagRepository } from './tag.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { TagSchema, TagSchemaClass } from './entities/tag.schema';

@Module({
  imports: [
    // import modules, etc.
    MongooseModule.forFeature([
      { name: TagSchemaClass.name, schema: TagSchema },
    ]),
  ],
  controllers: [],
  providers: [TagService, TagRepository],
  exports: [],
})
export class TagModule {}
