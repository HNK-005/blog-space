import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthService } from '../auth.service';

export const mockAuthService: DeepMocked<AuthService> =
  createMock<AuthService>();
