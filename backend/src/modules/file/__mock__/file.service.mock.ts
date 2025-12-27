import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { FileService } from '../file.service';

export const mockFileService: DeepMocked<FileService> =
  createMock<FileService>();
