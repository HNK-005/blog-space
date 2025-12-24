import { UploadDriver } from '../upload.enum';

export type UploadConfig = {
  driver: UploadDriver;
  maxFileSize: number;
};
