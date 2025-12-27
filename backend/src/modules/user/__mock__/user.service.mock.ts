import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserService } from '../user.service';

export const mockUserService: DeepMocked<UserService> =
  createMock<UserService>();
