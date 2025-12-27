import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailerService } from '../mailer/mailer.service';
import { mockUserService } from '../user/__mock__/user.service.mock';
import { mockMailerService } from '../mailer/__mock__/mock.service.mock';
import { AuthRegisterDto } from './dto/auth-register-login.dto';
import { RoleEnum, StatusEnum } from '../user/user.enum';
import { User } from '../user/domain/user';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailerService: jest.Mocked<MailerService>;

  const mockRegisterDto: AuthRegisterDto = {
    email: 'test@example.com',
    password: 'Password123!',
    fullName: 'John Doe',
  };

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: mockRegisterDto.email,
    fullName: mockRegisterDto.fullName,
    role: RoleEnum.USER,
    status: StatusEnum.INACTIVE,
  };

  const mockJwtToken = 'mock-jwt-token';
  const mockAuthConfig = {
    'auth.confirmEmailSecret': 'test-secret',
    'auth.confirmEmailExpires': '1d',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => mockAuthConfig[key]),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    mailerService = module.get(MailerService);

    // Setup default successful responses
    userService.create.mockResolvedValue(mockUser as User);
    jwtService.signAsync.mockResolvedValue(mockJwtToken);
    mailerService.activationEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(authService).toBeDefined();
    });
  });

  describe('register', () => {
    describe('Success Cases', () => {
      it('should successfully register a new user', async () => {
        await authService.register(mockRegisterDto);

        expect(userService.create).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(mailerService.activationEmail).toHaveBeenCalledTimes(1);
      });

      it('should create user with correct data and default role/status', async () => {
        await authService.register(mockRegisterDto);

        expect(userService.create).toHaveBeenCalledWith({
          ...mockRegisterDto,
          role: RoleEnum.USER,
          status: StatusEnum.INACTIVE,
        });
      });

      it('should generate JWT token with correct payload', async () => {
        await authService.register(mockRegisterDto);

        expect(jwtService.signAsync).toHaveBeenCalledWith(
          { confirmEmailUserId: mockUser.id },
          {
            secret: mockAuthConfig['auth.confirmEmailSecret'],
            expiresIn: mockAuthConfig['auth.confirmEmailExpires'],
          },
        );
      });

      it('should send activation email with generated token', async () => {
        await authService.register(mockRegisterDto);

        expect(mailerService.activationEmail).toHaveBeenCalledWith({
          to: mockRegisterDto.email,
          data: { hash: mockJwtToken },
        });
      });
    });

    describe('Error Cases', () => {
      it('should throw error if user creation fails', async () => {
        const error = new Error('User already exists');
        userService.create.mockRejectedValueOnce(error);

        await expect(authService.register(mockRegisterDto)).rejects.toThrow(
          error,
        );

        expect(userService.create).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).not.toHaveBeenCalled();
        expect(mailerService.activationEmail).not.toHaveBeenCalled();
      });

      it('should throw error if JWT token generation fails', async () => {
        const error = new Error('JWT signing failed');
        jwtService.signAsync.mockRejectedValueOnce(error);

        await expect(authService.register(mockRegisterDto)).rejects.toThrow(
          error,
        );

        expect(userService.create).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(mailerService.activationEmail).not.toHaveBeenCalled();
      });

      it('should throw error if activation email sending fails', async () => {
        const error = new Error('Email service unavailable');
        mailerService.activationEmail.mockRejectedValueOnce(error);

        await expect(authService.register(mockRegisterDto)).rejects.toThrow(
          error,
        );

        expect(userService.create).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(mailerService.activationEmail).toHaveBeenCalledTimes(1);
      });
    });

    describe('Edge Cases', () => {
      it('should not call subsequent methods if user creation fails early', async () => {
        userService.create.mockRejectedValueOnce(new Error('DB Error'));

        await expect(authService.register(mockRegisterDto)).rejects.toThrow();

        expect(jwtService.signAsync).not.toHaveBeenCalled();
        expect(mailerService.activationEmail).not.toHaveBeenCalled();
      });

      it('should handle email with different casing', async () => {
        const dtoWithUppercaseEmail = {
          ...mockRegisterDto,
          email: 'TEST@EXAMPLE.COM',
        };

        await authService.register(dtoWithUppercaseEmail);

        expect(userService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: dtoWithUppercaseEmail.email,
          }),
        );
      });
    });
  });
});
