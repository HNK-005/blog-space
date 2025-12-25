import { Module } from '@nestjs/common';
import { MailModule } from '@/providers/mail/mail.module';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    // import modules, etc.
    MailModule,
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
