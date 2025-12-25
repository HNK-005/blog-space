import { MailService } from '@/providers/mail/mail.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  constructor(private readonly mailService: MailService) {}

  async sendTestEmail() {
    await this.mailService.sendMail({
      to: 'test@example.com',
      subject: 'Test Email',
      templatePath: 'src/modules/mailer/mailer-templates/test.hbs',
      context: { name: 'Test User' },
    });
  }
}
