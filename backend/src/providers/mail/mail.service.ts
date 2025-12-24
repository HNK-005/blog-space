import { Injectable } from '@nestjs/common';
import fs from 'node:fs/promises';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/common/configs/config.type';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    if (this.configService.get('app.nodeEnv', { infer: true }) === 'test') {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: configService.get('mail.host', { infer: true }),
      port: configService.get('mail.port', { infer: true }),
      ignoreTLS: configService.get('mail.ignoreTLS', { infer: true }),
      secure: configService.get('mail.secure', { infer: true }),
      requireTLS: configService.get('mail.requireTLS', { infer: true }),
      auth: {
        user: configService.get('mail.user', { infer: true }),
        pass: configService.get('mail.password', { infer: true }),
      },
    });

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          defaultLayout: false,
        },
        viewPath: path.resolve('src/modules/mail/mail-templates'),
        extName: '.hbs',
      }),
    );
  }

  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    let html: string | undefined;

    if (templatePath) {
      const absolutePath = templatePath.endsWith('.hbs')
        ? path.resolve('src/modules/mail/mail-templates', templatePath)
        : path.resolve(
            'src/modules/mail/mail-templates',
            `${templatePath}.hbs`,
          );

      const template = await fs.readFile(absolutePath, 'utf-8');
      html = handlebars.compile(template, { strict: true })(context);
    }

    await this.transporter.sendMail({
      ...mailOptions,
      from:
        mailOptions.from ??
        `"${this.configService.get('mail.defaultName', { infer: true })}" <${this.configService.get('mail.defaultEmail', { infer: true })}>`,
      html: mailOptions.html ?? html,
    });
  }
}
