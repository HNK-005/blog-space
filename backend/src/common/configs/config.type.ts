import { DatabaseConfig } from '@/providers/database/config/database-config.type';
import { AppConfig } from './app-config.type';
import { MailConfig } from '@/providers/mail/config/mail-config.type';
import { FileConfig } from '@/modules/file/config/file-config.type';
import { AuthConfig } from '@/modules/auth/config/auth-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  file: FileConfig;
  mail: MailConfig;
  auth: AuthConfig;
};
