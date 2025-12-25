import { FileDriver } from '../file.enum';

export type FileConfig = {
  driver: FileDriver;
  maxFileSize: number;
};
