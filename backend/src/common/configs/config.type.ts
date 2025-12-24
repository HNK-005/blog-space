import { DatabaseConfig } from '@/providers/database/config/database-config.type';
import { AppConfig } from './app-config.type';
import { MailConfig } from '@/providers/mail/config/mail-config.type';
import { UploadConfig } from '@/providers/upload/config/upload-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  upload: UploadConfig;
  mail: MailConfig;
};
