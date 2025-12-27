import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { FileService } from '../file/file.service';
import { mockUserRepository } from './__mock__/user.repository.mock';
import { mockFileService } from '../file/__mock__/file.service.mock';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleEnum, StatusEnum } from './user.enum';
import { AuthProvidersEnum } from '../auth/auth.enum';
import { FileStatusEnum } from '../file/file.enum';
import { User } from './domain/user';
import { FileType } from '../file/domain/file';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let fileService: jest.Mocked<FileService>;

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'Password123!',
    fullName: 'John Doe',
    provider: AuthProvidersEnum.EMAIL,
    role: RoleEnum.USER,
    status: StatusEnum.INACTIVE,
  };

  const mockUser: User = {
    id: 'mocked-id',
    email: 'test@example.com',
    username: 'test',
    fullName: 'John Doe',
    password: 'hashed-Password123!',
    provider: AuthProvidersEnum.EMAIL,
    role: RoleEnum.USER,
    status: StatusEnum.INACTIVE,
    postCount: 0,
    commentCount: 0,
    followerCount: 0,
    followingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockFile: FileType = {
    id: 'file-id',
    path: '/uploads/avatar.jpg',
    status: FileStatusEnum.USED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    fileService = module.get(FileService);

    // Default mocks
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const result = await service.create(mockCreateUserDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        mockCreateUserDto.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockCreateUserDto.email,
          fullName: mockCreateUserDto.fullName,
          password: expect.stringContaining('hashed-'),
          role: RoleEnum.USER,
          status: StatusEnum.INACTIVE,
          provider: AuthProvidersEnum.EMAIL,
        }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should generate username from email', async () => {
      await service.create(mockCreateUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'test',
        }),
      );
    });

    it('should append nanoid to username if username already exists', async () => {
      userRepository.findByUsername.mockResolvedValueOnce(mockUser);

      await service.create(mockCreateUserDto);

      expect(userRepository.findByUsername).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringMatching(/^test.{5}$/),
        }),
      );
    });

    it('should throw UnprocessableEntityException if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            errors: {
              email: 'Email already exists',
            },
          }),
        }),
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should create user without password if not provided', async () => {
      const dtoWithoutPassword = { ...mockCreateUserDto };
      delete dtoWithoutPassword.password;

      await service.create(dtoWithoutPassword);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: undefined,
        }),
      );
    });

    it('should handle avatar upload', async () => {
      fileService.update.mockResolvedValue(mockFile);
      const dtoWithAvatar = {
        ...mockCreateUserDto,
        avatar: { id: 'file-id' },
      };

      await service.create(dtoWithAvatar);

      expect(fileService.update).toHaveBeenCalledWith('file-id', {
        status: FileStatusEnum.USED,
      });
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar: mockFile,
        }),
      );
    });

    it('should throw UnprocessableEntityException if avatar does not exist', async () => {
      fileService.update.mockResolvedValue(null);
      const dtoWithAvatar = {
        ...mockCreateUserDto,
        avatar: { id: 'invalid-file-id' },
      };

      await expect(service.create(dtoWithAvatar)).rejects.toThrow(
        UnprocessableEntityException,
      );
      await expect(service.create(dtoWithAvatar)).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            errors: {
              avatar: 'Image not exists',
            },
          }),
        }),
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should set avatar to null if explicitly provided as null', async () => {
      const dtoWithNullAvatar = {
        ...mockCreateUserDto,
        avatar: null,
      };

      await service.create(dtoWithNullAvatar);

      expect(fileService.update).not.toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar: null,
        }),
      );
    });

    it('should use default role and status if not provided', async () => {
      const dtoWithoutRoleStatus = { ...mockCreateUserDto };
      delete dtoWithoutRoleStatus.role;
      delete dtoWithoutRoleStatus.status;

      await service.create(dtoWithoutRoleStatus);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: RoleEnum.USER,
          status: StatusEnum.INACTIVE,
        }),
      );
    });

    it('should use provided role and status', async () => {
      const dtoWithRoleStatus = {
        ...mockCreateUserDto,
        role: RoleEnum.ADMIN,
        status: StatusEnum.ACTIVE,
      };

      await service.create(dtoWithRoleStatus);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: RoleEnum.ADMIN,
          status: StatusEnum.ACTIVE,
        }),
      );
    });

    it('should use EMAIL provider as default if not provided', async () => {
      const dtoWithoutProvider = { ...mockCreateUserDto };
      delete dtoWithoutProvider.provider;

      await service.create(dtoWithoutProvider);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: AuthProvidersEnum.EMAIL,
        }),
      );
    });
  });
});
