import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { mockAuthService } from './__mock__/auth.service.mock';
import { AuthRegisterDto } from './dto/auth-register-login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockRegisterDto: AuthRegisterDto = {
    email: 'test@example.com',
    password: 'Password123!',
    fullName: 'John Doe',
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
});
