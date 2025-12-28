import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

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

  const mockUser: User = {
    id: 'user-123',
    email: mockRegisterDto.email,
    fullName: mockRegisterDto.fullName,
    username: 'test',
    role: RoleEnum.USER,
    status: StatusEnum.INACTIVE,
    postCount: 0,
    commentCount: 0,
    followerCount: 0,
    followingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

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
            verifyAsync: jest.fn(),
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
    userService.create.mockResolvedValue(mockUser);
    userService.findById.mockResolvedValue(mockUser);
    userService.findByEmail.mockResolvedValue(mockUser);
    userService.update.mockResolvedValue(mockUser);
    jwtService.signAsync.mockResolvedValue(mockJwtToken);
    jwtService.verifyAsync.mockResolvedValue({
      confirmEmailUserId: mockUser.id,
    });
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
        expect(userService.findByEmail).toHaveBeenCalledTimes(1);
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

      it('should call sendActivationEmail with user email', async () => {
        await authService.register(mockRegisterDto);

        expect(userService.findByEmail).toHaveBeenCalledWith(
          mockRegisterDto.email,
        );
        expect(jwtService.signAsync).toHaveBeenCalledWith(
          { confirmEmailUserId: mockUser.id },
          {
            secret: mockAuthConfig['auth.confirmEmailSecret'],
            expiresIn: mockAuthConfig['auth.confirmEmailExpires'],
          },
        );
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
        expect(userService.findByEmail).not.toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
        expect(mailerService.activationEmail).not.toHaveBeenCalled();
      });

      it('should throw error if sendActivationEmail fails', async () => {
        const error = new NotFoundException('User not found');
        userService.findByEmail.mockResolvedValueOnce(null);

        await expect(authService.register(mockRegisterDto)).rejects.toThrow(
          error,
        );

        expect(userService.create).toHaveBeenCalledTimes(1);
        expect(userService.findByEmail).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('confirmEmail', () => {
    const validHash = 'valid-jwt-hash';
    const mockUserId = 'user-123';

    beforeEach(() => {
      jwtService.verifyAsync.mockResolvedValue({
        confirmEmailUserId: mockUserId,
      });

      userService.findById.mockResolvedValue({
        ...mockUser,
        id: mockUserId,
        status: StatusEnum.INACTIVE,
      });

      userService.update.mockResolvedValue({
        ...mockUser,
        status: StatusEnum.ACTIVE,
      });
    });

    describe('Success Cases', () => {
      it('should successfully confirm email with valid hash', async () => {
        await authService.confirmEmail(validHash);

        expect(jwtService.verifyAsync).toHaveBeenCalledWith(validHash, {
          secret: mockAuthConfig['auth.confirmEmailSecret'],
        });
        expect(userService.findById).toHaveBeenCalledWith(mockUserId);
        expect(userService.update).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({
            status: StatusEnum.ACTIVE,
          }),
        );
      });

      it('should verify JWT token with correct secret', async () => {
        await authService.confirmEmail(validHash);

        expect(jwtService.verifyAsync).toHaveBeenCalledWith(validHash, {
          secret: mockAuthConfig['auth.confirmEmailSecret'],
        });
      });

      it('should update user status to ACTIVE', async () => {
        await authService.confirmEmail(validHash);

        expect(userService.update).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({
            status: StatusEnum.ACTIVE,
          }),
        );
      });
    });

    describe('Error Cases', () => {
      it('should throw UnauthorizedException if hash is invalid', async () => {
        jwtService.verifyAsync.mockRejectedValueOnce(
          new Error('Invalid token'),
        );

        await expect(authService.confirmEmail('invalid-hash')).rejects.toThrow(
          new UnauthorizedException('Invalid hash'),
        );

        expect(userService.findById).not.toHaveBeenCalled();
        expect(userService.update).not.toHaveBeenCalled();
      });

      it('should throw UnauthorizedException if JWT verification fails', async () => {
        jwtService.verifyAsync.mockRejectedValueOnce(
          new Error('Token expired'),
        );

        await expect(authService.confirmEmail(validHash)).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('should throw NotFoundException if user does not exist', async () => {
        userService.findById.mockResolvedValueOnce(null);

        await expect(authService.confirmEmail(validHash)).rejects.toThrow(
          new NotFoundException('User not found'),
        );

        expect(userService.update).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException if user status is not INACTIVE', async () => {
        const activeUser = {
          ...mockUser,
          id: mockUserId,
          status: StatusEnum.ACTIVE,
        } as User;

        userService.findById.mockResolvedValueOnce(activeUser);

        await expect(authService.confirmEmail(validHash)).rejects.toThrow(
          new NotFoundException('User not found'),
        );

        expect(userService.update).not.toHaveBeenCalled();
      });
    });

    describe('Edge Cases', () => {
      it('should handle malformed JWT token', async () => {
        jwtService.verifyAsync.mockRejectedValueOnce(
          new Error('Malformed token'),
        );

        await expect(
          authService.confirmEmail('malformed.jwt.token'),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('should not update if user lookup fails', async () => {
        userService.findById.mockRejectedValueOnce(new Error('Database error'));

        await expect(authService.confirmEmail(validHash)).rejects.toThrow(
          'Database error',
        );

        expect(userService.update).not.toHaveBeenCalled();
      });

      it('should handle empty hash string', async () => {
        jwtService.verifyAsync.mockRejectedValueOnce(new Error('Empty token'));

        await expect(authService.confirmEmail('')).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('should verify user ID extraction from JWT payload', async () => {
        const customUserId = 'custom-user-id-456';
        jwtService.verifyAsync.mockResolvedValueOnce({
          confirmEmailUserId: customUserId,
        });

        userService.findById.mockResolvedValueOnce({
          ...mockUser,
          id: customUserId,
          status: StatusEnum.INACTIVE,
        });

        await authService.confirmEmail(validHash);

        expect(userService.findById).toHaveBeenCalledWith(customUserId);
        expect(userService.update).toHaveBeenCalledWith(
          customUserId,
          expect.any(Object),
        );
      });
    });
  });

  describe('sendActivationEmail', () => {
    const userEmail = 'test@example.com';

    describe('Success Cases', () => {
      it('should successfully send activation email', async () => {
        await authService.sendActivationEmail(userEmail);

        expect(userService.findByEmail).toHaveBeenCalledWith(userEmail);
        expect(jwtService.signAsync).toHaveBeenCalledWith(
          { confirmEmailUserId: mockUser.id },
          {
            secret: mockAuthConfig['auth.confirmEmailSecret'],
            expiresIn: mockAuthConfig['auth.confirmEmailExpires'],
          },
        );
        expect(mailerService.activationEmail).toHaveBeenCalledWith({
          to: userEmail,
          data: { hash: mockJwtToken },
        });
      });

      it('should generate JWT token with correct payload', async () => {
        await authService.sendActivationEmail(userEmail);

        expect(jwtService.signAsync).toHaveBeenCalledWith(
          { confirmEmailUserId: mockUser.id },
          {
            secret: mockAuthConfig['auth.confirmEmailSecret'],
            expiresIn: mockAuthConfig['auth.confirmEmailExpires'],
          },
        );
      });

      it('should send email with correct data', async () => {
        await authService.sendActivationEmail(userEmail);

        expect(mailerService.activationEmail).toHaveBeenCalledWith({
          to: userEmail,
          data: { hash: mockJwtToken },
        });
      });
    });

    describe('Error Cases', () => {
      it('should throw NotFoundException if user does not exist', async () => {
        userService.findByEmail.mockResolvedValueOnce(null);

        await expect(
          authService.sendActivationEmail(userEmail),
        ).rejects.toThrow(new NotFoundException('User not found'));

        expect(jwtService.signAsync).not.toHaveBeenCalled();
        expect(mailerService.activationEmail).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException if user status is not INACTIVE', async () => {
        const activeUser = {
          ...mockUser,
          status: StatusEnum.ACTIVE,
        } as User;

        userService.findByEmail.mockResolvedValueOnce(activeUser);

        await expect(
          authService.sendActivationEmail(userEmail),
        ).rejects.toThrow(new NotFoundException('User not found'));

        expect(jwtService.signAsync).not.toHaveBeenCalled();
        expect(mailerService.activationEmail).not.toHaveBeenCalled();
      });

      it('should throw error if JWT signing fails', async () => {
        const error = new Error('JWT signing failed');
        jwtService.signAsync.mockRejectedValueOnce(error);

        await expect(
          authService.sendActivationEmail(userEmail),
        ).rejects.toThrow(error);

        expect(userService.findByEmail).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(mailerService.activationEmail).not.toHaveBeenCalled();
      });

      it('should throw error if email sending fails', async () => {
        const error = new Error('Email service unavailable');
        mailerService.activationEmail.mockRejectedValueOnce(error);

        await expect(
          authService.sendActivationEmail(userEmail),
        ).rejects.toThrow(error);

        expect(userService.findByEmail).toHaveBeenCalledTimes(1);
        expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
        expect(mailerService.activationEmail).toHaveBeenCalledTimes(1);
      });
    });

    describe('Edge Cases', () => {
      it('should handle database errors when finding user', async () => {
        const error = new Error('Database connection failed');
        userService.findByEmail.mockRejectedValueOnce(error);

        await expect(
          authService.sendActivationEmail(userEmail),
        ).rejects.toThrow(error);

        expect(jwtService.signAsync).not.toHaveBeenCalled();
        expect(mailerService.activationEmail).not.toHaveBeenCalled();
      });

      it('should handle email with different casing', async () => {
        const uppercaseEmail = 'TEST@EXAMPLE.COM';

        await authService.sendActivationEmail(uppercaseEmail);

        expect(userService.findByEmail).toHaveBeenCalledWith(uppercaseEmail);
      });

      it('should use correct config values for JWT', async () => {
        await authService.sendActivationEmail(userEmail);

        expect(jwtService.signAsync).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            secret: 'test-secret',
            expiresIn: '1d',
          }),
        );
      });
    });
  });
});
