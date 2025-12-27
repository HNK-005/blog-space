import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { MailService } from '@/providers/mail/mail.service';
import { ConfigService } from '@nestjs/config';

describe('MailerService', () => {
  let service: MailerService;
  let mailService: MailService;

  const mockMailService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'app.name') return 'TestApp';
      return null;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'app.frontendDomain') return 'http://localhost:3000';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendTestEmail', () => {
    it('should call mailService.sendMail with test parameters', async () => {
      await service.sendTestEmail();

      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test Email',
        templatePath: 'src/modules/mailer/mailer-templates/test.hbs',
        context: { name: 'Test User' },
      });
    });
  });

  describe('activationEmail', () => {
    it('should call mailService.sendMail with correct activation data and URL', async () => {
      const mailData = {
        to: 'user@example.com',
        data: { hash: 'abc-123' },
      };

      await service.activationEmail(mailData);

      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: mailData.to,
        subject: 'Confirm your email',
        text: expect.stringContaining(
          'http://localhost:3000/auth/confirm-email?hash=abc-123',
        ),
        templatePath: 'src/modules/mailer/mailer-templates/activation.hbs',
        context: expect.objectContaining({
          url: 'http://localhost:3000/auth/confirm-email?hash=abc-123',
          app_name: 'TestApp',
          title: 'Confirm your email',
        }),
      });
    });
  });
});
