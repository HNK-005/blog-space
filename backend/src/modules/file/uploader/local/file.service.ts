import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/common/configs/config.type';
import { FileType } from '@/modules/file/domain/file';
import { FileService } from '../../file.service';

@Injectable()
export class FileLocalService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly fileService: FileService,
  ) {}

  async create(file: Express.Multer.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        errors: {
          file: 'Selected file is invalid',
        },
      });
    }

    const backendDomain = this.configService.get('app.backendDomain', {
      infer: true,
    });
    const apiPrefix = this.configService.get('app.apiPrefix', {
      infer: true,
    });

    const filePath = await this.fileService.create({
      path: `${backendDomain}/${apiPrefix}/v1/${file.path}`,
    } as FileType);

    return {
      file: filePath,
    };
  }
}
