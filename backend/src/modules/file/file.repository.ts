import { Injectable } from '@nestjs/common';
import { FileSchemaClass } from './entities/file.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FileMapper } from './mappers/file.mapper';
import { FileType } from './domain/file';

@Injectable()
export class FileRepository {
  constructor(
    @InjectModel(FileSchemaClass.name)
    private readonly fileModel: Model<FileSchemaClass>,
  ) {}

  async create(data: Omit<FileType, 'id'>): Promise<FileType> {
    const createdFile = new this.fileModel(data);
    const fileObject = await createdFile.save();
    return FileMapper.toDomain(fileObject);
  }
}
