import { Injectable } from '@nestjs/common';
import { FileSchemaClass } from './entities/file.schema';
import { FilterQuery, Model } from 'mongoose';
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

  async update(
    id: FileType['id'],
    payload: Partial<FileType>,
    filter?: FilterQuery<FileSchemaClass>,
  ): Promise<FileType | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    filter = { ...filter, _id: id };

    const file = await this.fileModel.findOne(filter);

    if (!file) {
      return null;
    }

    const fileObject = await this.fileModel.findOneAndUpdate(
      filter,
      FileMapper.toPersistence({
        ...FileMapper.toDomain(file),
        ...clonedPayload,
      }),
      { new: true },
    );

    return fileObject ? FileMapper.toDomain(fileObject) : null;
  }
}
