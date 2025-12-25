import {
  forwardRef,
  Module,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileLocalController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { AllConfigType } from '@/common/configs/config.type';
import { FileModule } from '../../file.module';
import { FileLocalService } from './file.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
              return callback(
                new UnprocessableEntityException({
                  errors: {
                    file: `Can't upload ${file.originalname} file. Only image files are allowed.`,
                  },
                }),
                false,
              );
            }

            callback(null, true);
          },
          storage: diskStorage({
            destination: './files',
            filename: (request, file, callback) => {
              callback(
                null,
                `${randomStringGenerator()}.${file.originalname
                  .split('.')
                  .pop()
                  ?.toLowerCase()}`,
              );
            },
          }),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
          },
        };
      },
    }),
    forwardRef(() => FileModule),
  ],
  controllers: [FileLocalController],
  providers: [FileLocalService],
})
export class FileLocalModule {}
