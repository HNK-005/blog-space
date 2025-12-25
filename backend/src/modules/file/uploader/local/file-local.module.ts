import { UploadLocalModule } from '@/providers/upload/upload-local.module';
import { Module } from '@nestjs/common';
import { FileLocalService } from './file-local.service';

@Module({
  imports: [
    // import modules, etc.
    UploadLocalModule,
  ],
  controllers: [],
  providers: [FileLocalService],
})
export class FileLocalModule {}
