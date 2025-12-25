import { Module } from '@nestjs/common';
import { MailService } from '@/providers/mail/mail.service';
import { MailModule } from '@/providers/mail/mail.module';

@Module({
  imports: [
    // import modules, etc.
    MailModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailerModule {}
