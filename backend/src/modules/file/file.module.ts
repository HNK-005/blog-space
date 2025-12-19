import {
  // common
  Module,
} from '@nestjs/common';

import { FileService } from './file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema, FileSchemaClass } from './entities/file.schema';
import { FileRepository } from './file.repository';

@Module({
  imports: [
    // import modules, etc.
    MongooseModule.forFeature([
      { name: FileSchemaClass.name, schema: FileSchema },
    ]),
  ],
  providers: [FileService, FileRepository],
  exports: [FileService, FileRepository],
})
export class FileModule {}
