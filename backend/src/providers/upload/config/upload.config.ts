import { registerAs } from '@nestjs/config';

import { IsEnum } from 'class-validator';
import validateConfig from '@/common/utils/validate-config';
import { UploadConfig } from './upload-config.type';
import { UploadDriver } from '../upload.enum';

class EnvironmentVariablesValidator {
  @IsEnum(UploadDriver)
  FILE_DRIVER: UploadDriver;
}

export default registerAs<UploadConfig>('upload', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    driver:
      (process.env.FILE_DRIVER as UploadDriver | undefined) ??
      UploadDriver.LOCAL,
    maxFileSize: 5242880, // 5mb
  };
});
