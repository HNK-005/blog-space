import { MailService } from '@/providers/mail/mail.service';
import { Injectable } from '@nestjs/common';
import { MailData } from './mailer-data.interface';
import { AllConfigType } from '@/common/configs/config.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly mailService: MailService,
  ) {}

  async sendTestEmail() {
    await this.mailService.sendMail({
      to: 'test@example.com',
      subject: 'Test Email',
      templatePath: 'src/modules/mailer/mailer-templates/test.hbs',
      context: { name: 'Test User' },
    });
  }

  async activationEmail(mailData: MailData<{ hash: string }>) {
    const {
      to,
      data: { hash },
    } = mailData;

    const emailConfirmTitle: string = 'Confirm your email';
    const text1: string = 'Hi there';
    const text2: string = 'Thanks for registering at';
    const text3: string =
      'Please confirm your email address to activate your account on';

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/auth/confirm-email',
    );

    url.searchParams.set('hash', hash);

    await this.mailService.sendMail({
      to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: 'src/modules/mailer/mailer-templates/activation.hbs',
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }
}
