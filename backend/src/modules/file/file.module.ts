import {
  // common
  Module,
} from '@nestjs/common';

import { FileService } from './file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema, FileSchemaClass } from './entities/file.schema';
import { FileRepository } from './file.repository';
import { FileLocalModule } from './uploader/local/file-local.module';

@Module({
  imports: [
    // import modules, etc.
    MongooseModule.forFeature([
      { name: FileSchemaClass.name, schema: FileSchema },
    ]),
    FileLocalModule,
  ],
  providers: [FileService, FileRepository],
  exports: [FileService, FileRepository],
})
export class FileModule {}
