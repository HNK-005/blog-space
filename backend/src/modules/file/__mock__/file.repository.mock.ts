import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { FileRepository } from '../file.repository';

export const mockFileRepository: DeepMocked<FileRepository> =
  createMock<FileRepository>();
