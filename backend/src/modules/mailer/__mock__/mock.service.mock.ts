import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MailerService } from '../mailer.service';

export const mockMailerService: DeepMocked<MailerService> =
  createMock<MailerService>();
