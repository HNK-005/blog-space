import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserRepository } from '../user.repository';

export const mockUserRepository: DeepMocked<UserRepository> =
  createMock<UserRepository>();
