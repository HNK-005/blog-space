import { Injectable } from '@nestjs/common';
import { FileType } from './domain/file';
import { FileRepository } from './file.repository';

@Injectable()
export class FileService {
  constructor(private readonly fileRepository: FileRepository) {}

  create(file: FileType): Promise<FileType> {
    return this.fileRepository.create(file);
  }
}
