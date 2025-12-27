import { Injectable } from '@nestjs/common';
import { FileType } from './domain/file';
import { FileRepository } from './file.repository';
import { FileSchemaClass } from './entities/file.schema';
import { FilterQuery } from 'mongoose';
import { NullableType } from '@/common/types/nullable.type';

@Injectable()
export class FileService {
  constructor(private readonly fileRepository: FileRepository) {}

  create(file: FileType): Promise<FileType> {
    return this.fileRepository.create(file);
  }

  update(
    id: FileType['id'],
    payload: Partial<FileType>,
    filter?: FilterQuery<FileSchemaClass>,
  ): Promise<NullableType<FileType>> {
    return this.fileRepository.update(id, payload, filter);
  }
}
