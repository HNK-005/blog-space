import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowRepository } from './follow.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowSchema, FollowSchemaClass } from './entities/follow.schema';

@Module({
  imports: [
    // import modules, etc.
    MongooseModule.forFeature([
      {
        name: FollowSchemaClass.name,
        schema: FollowSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [FollowService, FollowRepository],
  exports: [FollowService],
})
export class FollowModule {}
