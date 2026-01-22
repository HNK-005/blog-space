import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { mockAuthService } from './__mock__/auth.service.mock';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthSendActivationEmailDto } from './dto/auth-send-activation-email';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockRegisterDto: AuthRegisterDto = {
    email: 'test@example.com',
    password: 'Password123!',
    fullName: 'John Doe',
  };

  const mockConfirmEmailDto: AuthConfirmEmailDto = {
    hash: 'valid-jwt-hash-token',
  };

  const mockSendActivationEmailDto: AuthSendActivationEmailDto = {
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    // Setup default responses
    authService.register.mockResolvedValue(undefined);
    authService.confirmEmail.mockResolvedValue(undefined);
    authService.sendActivationEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('register', () => {
    it('should call authService.register with correct data', async () => {
      await controller.register(mockRegisterDto);

      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should successfully complete registration', async () => {
      await expect(
        controller.register(mockRegisterDto),
      ).resolves.toBeUndefined();
    });

    it('should throw error if registration fails', async () => {
      const error = new Error('Registration failed');
      authService.register.mockRejectedValueOnce(error);

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(error);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid email format');
      authService.register.mockRejectedValueOnce(validationError);

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        validationError,
      );
    });
  });

  describe('confirmEmail', () => {
    it('should call authService.confirmEmail with correct hash', async () => {
      await controller.confirmEmail(mockConfirmEmailDto);

      expect(authService.confirmEmail).toHaveBeenCalledWith(
        mockConfirmEmailDto.hash,
      );
      expect(authService.confirmEmail).toHaveBeenCalledTimes(1);
    });

    it('should successfully confirm email', async () => {
      await expect(
        controller.confirmEmail(mockConfirmEmailDto),
      ).resolves.toBeUndefined();
    });

    it('should throw error if email confirmation fails', async () => {
      const error = new Error('Invalid hash');
      authService.confirmEmail.mockRejectedValueOnce(error);

      await expect(
        controller.confirmEmail(mockConfirmEmailDto),
      ).rejects.toThrow(error);
      expect(authService.confirmEmail).toHaveBeenCalledTimes(1);
    });

    it('should handle UnauthorizedException for invalid hash', async () => {
      const unauthorizedError = new Error('Invalid or expired hash');
      authService.confirmEmail.mockRejectedValueOnce(unauthorizedError);

      await expect(
        controller.confirmEmail(mockConfirmEmailDto),
      ).rejects.toThrow(unauthorizedError);
    });

    it('should handle NotFoundException for non-existent user', async () => {
      const notFoundError = new Error('User not found');
      authService.confirmEmail.mockRejectedValueOnce(notFoundError);

      await expect(
        controller.confirmEmail(mockConfirmEmailDto),
      ).rejects.toThrow(notFoundError);
    });

    it('should pass hash correctly from DTO', async () => {
      const customHash = 'custom-jwt-hash-123';
      const customDto: AuthConfirmEmailDto = { hash: customHash };

      await controller.confirmEmail(customDto);

      expect(authService.confirmEmail).toHaveBeenCalledWith(customHash);
    });
  });

  describe('sendActivationEmail', () => {
    it('should call authService.sendActivationEmail with correct email', async () => {
      await controller.sendActivationEmail(mockSendActivationEmailDto);

      expect(authService.sendActivationEmail).toHaveBeenCalledWith(
        mockSendActivationEmailDto.email,
      );
      expect(authService.sendActivationEmail).toHaveBeenCalledTimes(1);
    });

    it('should successfully send activation email', async () => {
      await expect(
        controller.sendActivationEmail(mockSendActivationEmailDto),
      ).resolves.toBeUndefined();
    });

    it('should throw error if sending activation email fails', async () => {
      const error = new Error('Email service unavailable');
      authService.sendActivationEmail.mockRejectedValueOnce(error);

      await expect(
        controller.sendActivationEmail(mockSendActivationEmailDto),
      ).rejects.toThrow(error);
      expect(authService.sendActivationEmail).toHaveBeenCalledTimes(1);
    });

    it('should handle NotFoundException for non-existent user', async () => {
      const notFoundError = new Error('User not found');
      authService.sendActivationEmail.mockRejectedValueOnce(notFoundError);

      await expect(
        controller.sendActivationEmail(mockSendActivationEmailDto),
      ).rejects.toThrow(notFoundError);
    });

    it('should handle NotFoundException for already active user', async () => {
      const error = new Error('User already active');
      authService.sendActivationEmail.mockRejectedValueOnce(error);

      await expect(
        controller.sendActivationEmail(mockSendActivationEmailDto),
      ).rejects.toThrow(error);
    });

    it('should pass email correctly from DTO', async () => {
      const customEmail = 'custom@example.com';
      const customDto: AuthSendActivationEmailDto = { email: customEmail };

      await controller.sendActivationEmail(customDto);

      expect(authService.sendActivationEmail).toHaveBeenCalledWith(customEmail);
    });

    it('should handle email validation errors', async () => {
      const validationError = new Error('Invalid email format');
      authService.sendActivationEmail.mockRejectedValueOnce(validationError);

      await expect(
        controller.sendActivationEmail(mockSendActivationEmailDto),
      ).rejects.toThrow(validationError);
    });
  });
  describe('login', () => {
    // Tests for the login method would go here
  });
});
