import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';

import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { FileService } from '../file/file.service';

import { User } from './domain/user';
import { FileType } from '../file/domain/file';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { RoleEnum, StatusEnum } from './user.enum';
import { AuthProvidersEnum } from '../auth/auth.enum';
import { FileStatusEnum } from '../file/file.enum';

// Mock the @Transaction decorator to avoid database connection requirements
jest.mock('nestjs-mongo-transactions', () => ({
  Transaction:
    () => (_target: any, _key: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('UserService', () => {
  let service: UserService;
  let usersRepository: jest.Mocked<UserRepository>;
  let filesService: jest.Mocked<FileService>;

  // Mock data fixtures
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    username: 'test',
    password: 'hashed-password',
    provider: AuthProvidersEnum.EMAIL,
    role: RoleEnum.USER,
    status: StatusEnum.INACTIVE,
    postCount: 0,
    commentCount: 0,
    followerCount: 0,
    followingCount: 0,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockFile: FileType = {
    id: 'file-123',
    path: '/uploads/avatar.jpg',
    status: FileStatusEnum.USED,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as FileType;

  const mockOldFile: FileType = {
    id: 'old-file-123',
    path: '/uploads/old-avatar.jpg',
    status: FileStatusEnum.USED,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as FileType;

  beforeEach(async () => {
    // Create mock implementations
    const usersRepositoryMock = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
    };

    const filesServiceMock = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: usersRepositoryMock,
        },
        {
          provide: FileService,
          useValue: filesServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get(UserRepository);
    filesService = module.get(FileService);

    // Set up default successful responses
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.findByUsername.mockResolvedValue(null);
    usersRepository.create.mockResolvedValue(mockUser);
    usersRepository.findById.mockResolvedValue(mockUser);
    usersRepository.update.mockResolvedValue(mockUser);
    filesService.update.mockResolvedValue(mockFile);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(usersRepository).toBeDefined();
      expect(filesService).toBeDefined();
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
    };

    describe('Success Cases', () => {
      it('should create user with hashed password and default values', async () => {
        const result = await service.create(createUserDto);

        expect(usersRepository.findByUsername).toHaveBeenCalledWith('test');
        expect(usersRepository.findByEmail).toHaveBeenCalledWith(
          createUserDto.email,
        );
        expect(usersRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: createUserDto.email,
            fullName: createUserDto.fullName,
            username: 'test',
            password: 'hashed-Password123!',
            role: RoleEnum.USER,
            status: StatusEnum.INACTIVE,
            provider: AuthProvidersEnum.EMAIL,
          }),
        );
        expect(result).toEqual(mockUser);
      });

      it('should generate username from email prefix', async () => {
        await service.create(createUserDto);

        expect(usersRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'test',
          }),
        );
      });

      it('should append nanoid suffix when username already exists', async () => {
        usersRepository.findByUsername.mockResolvedValueOnce(mockUser);

        await service.create(createUserDto);

        expect(usersRepository.findByUsername).toHaveBeenCalledWith('test');
        expect(usersRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'testmocke', // 'mocked-id'.substring(0, 5) = 'mocke'
          }),
        );
      });

      it('should create user without password when not provided', async () => {
        const dtoWithoutPassword = { ...createUserDto };
        delete dtoWithoutPassword.password;

        await service.create(dtoWithoutPassword);

        expect(usersRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            password: undefined,
          }),
        );
      });

      it('should create user with avatar when avatar.id is provided', async () => {
        const dtoWithAvatar = {
          ...createUserDto,
          avatar: { id: 'file-123' } as any,
        };

        await service.create(dtoWithAvatar);

        expect(filesService.update).toHaveBeenCalledWith('file-123', {
          status: FileStatusEnum.USED,
        });
        expect(usersRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            avatar: mockFile,
          }),
        );
      });

      it('should set avatar to null when avatar is explicitly null', async () => {
        const dtoWithNullAvatar = {
          ...createUserDto,
          avatar: null,
        };

        await service.create(dtoWithNullAvatar);

        expect(filesService.update).not.toHaveBeenCalled();
        expect(usersRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            avatar: null,
          }),
        );
      });

      it('should use custom role and status when provided', async () => {
        const dtoWithCustom = {
          ...createUserDto,
          role: RoleEnum.ADMIN,
          status: StatusEnum.ACTIVE,
        };

        await service.create(dtoWithCustom);

        expect(usersRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            role: RoleEnum.ADMIN,
            status: StatusEnum.ACTIVE,
          }),
        );
      });

      it('should use custom provider when provided', async () => {
        const dtoWithProvider = {
          ...createUserDto,
          provider: AuthProvidersEnum.GOOGLE,
        };

        await service.create(dtoWithProvider);

        expect(usersRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: AuthProvidersEnum.GOOGLE,
          }),
        );
      });
    });

    describe('Error Cases', () => {
      it('should throw UnprocessableEntityException when email already exists', async () => {
        usersRepository.findByEmail.mockResolvedValueOnce(mockUser);

        await expect(service.create(createUserDto)).rejects.toThrow(
          UnprocessableEntityException,
        );
        expect(usersRepository.create).not.toHaveBeenCalled();
      });

      it('should throw UnprocessableEntityException when avatar file does not exist', async () => {
        filesService.update.mockResolvedValueOnce(null);

        const dtoWithInvalidAvatar = {
          ...createUserDto,
          avatar: { id: 'invalid-file-id' } as any,
        };

        await expect(service.create(dtoWithInvalidAvatar)).rejects.toThrow(
          UnprocessableEntityException,
        );
        expect(usersRepository.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('update', () => {
    const userId = 'user-123';

    describe('Success Cases', () => {
      it('should update user with valid data', async () => {
        const updateDto: UpdateUserDto = {
          fullName: 'Updated Name',
          bio: 'Updated bio',
        };

        const result = await service.update(userId, updateDto);

        expect(usersRepository.findById).toHaveBeenCalledWith(userId);
        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            fullName: 'Updated Name',
            bio: 'Updated bio',
          }),
        );
        expect(result).toEqual(mockUser);
      });

      it('should validate and update email when provided', async () => {
        const updateDto: UpdateUserDto = {
          email: 'newemail@example.com',
        };

        await service.update(userId, updateDto);

        expect(usersRepository.findByEmail).toHaveBeenCalledWith(
          'newemail@example.com',
        );
        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            email: 'newemail@example.com',
          }),
        );
      });

      it('should validate and update newEmail when provided', async () => {
        const updateDto: UpdateUserDto = {
          newEmail: 'newemail@example.com',
        };

        await service.update(userId, updateDto);

        expect(usersRepository.findByEmail).toHaveBeenCalledWith(
          'newemail@example.com',
        );
        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            newEmail: 'newemail@example.com',
          }),
        );
      });

      it('should set newEmail to empty string when not provided', async () => {
        const updateDto: UpdateUserDto = {
          fullName: 'Updated',
        };

        await service.update(userId, updateDto);

        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            newEmail: '',
          }),
        );
      });

      it('should hash new password when different from current', async () => {
        usersRepository.findById.mockResolvedValueOnce({
          ...mockUser,
          password: 'hashed-old-password',
        });

        const updateDto: UpdateUserDto = {
          password: 'NewPassword123!',
        };

        await service.update(userId, updateDto);

        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            password: 'hashed-NewPassword123!',
          }),
        );
      });

      it('should not rehash password when same as current', async () => {
        usersRepository.findById.mockResolvedValueOnce({
          ...mockUser,
          password: 'hashed-same',
        });

        const updateDto: UpdateUserDto = {
          password: 'hashed-same',
        };

        await service.update(userId, updateDto);

        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            password: undefined,
          }),
        );
      });

      it('should update user counts', async () => {
        const updateDto: UpdateUserDto = {
          postCount: 10,
          commentCount: 5,
          followerCount: 20,
          followingCount: 15,
        };

        await service.update(userId, updateDto);

        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            postCount: 10,
            commentCount: 5,
            followerCount: 20,
            followingCount: 15,
          }),
        );
      });

      it('should update role and status when provided', async () => {
        const updateDto: UpdateUserDto = {
          role: RoleEnum.ADMIN,
          status: StatusEnum.ACTIVE,
        };

        await service.update(userId, updateDto);

        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            role: RoleEnum.ADMIN,
            status: StatusEnum.ACTIVE,
          }),
        );
      });

      it('should update avatar and orphan old one', async () => {
        usersRepository.findById.mockResolvedValueOnce({
          ...mockUser,
          avatar: mockOldFile,
        });

        filesService.update
          .mockResolvedValueOnce(mockOldFile) // Orphan old
          .mockResolvedValueOnce(mockFile); // Set new as USED

        const updateDto: UpdateUserDto = {
          avatar: { id: 'file-123' } as any,
        };

        await service.update(userId, updateDto);

        expect(filesService.update).toHaveBeenNthCalledWith(1, 'old-file-123', {
          status: FileStatusEnum.ORPHAN,
        });
        expect(filesService.update).toHaveBeenNthCalledWith(
          2,
          'file-123',
          { status: FileStatusEnum.USED },
          { status: { $in: [FileStatusEnum.UPLOADED, FileStatusEnum.ORPHAN] } },
        );
        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            avatar: mockFile,
          }),
        );
      });

      it('should remove avatar when set to null', async () => {
        usersRepository.findById.mockResolvedValueOnce({
          ...mockUser,
          avatar: mockOldFile,
        });

        filesService.update.mockResolvedValueOnce(mockOldFile);

        const updateDto: UpdateUserDto = {
          avatar: null,
        };

        await service.update(userId, updateDto);

        expect(filesService.update).toHaveBeenCalledWith('old-file-123', {
          status: FileStatusEnum.ORPHAN,
        });
        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            avatar: null,
          }),
        );
      });

      it('should leave avatar unchanged when not provided', async () => {
        usersRepository.findById.mockResolvedValueOnce({
          ...mockUser,
          avatar: mockFile,
        });

        const updateDto: UpdateUserDto = {
          fullName: 'Updated',
        };

        await service.update(userId, updateDto);

        expect(filesService.update).not.toHaveBeenCalled();
        expect(usersRepository.update).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            avatar: undefined,
          }),
        );
      });
    });

    describe('Error Cases', () => {
      it('should throw when email already exists for another user', async () => {
        const existingUser = {
          ...mockUser,
          id: 'different-user-id',
        };

        usersRepository.findByEmail.mockResolvedValueOnce(existingUser);

        const updateDto: UpdateUserDto = {
          email: 'existing@example.com',
        };

        await expect(service.update(userId, updateDto)).rejects.toThrow(
          UnprocessableEntityException,
        );
      });

      it('should throw when newEmail already exists for another user', async () => {
        const existingUser = {
          ...mockUser,
          id: 'different-user-id',
        };

        usersRepository.findByEmail.mockResolvedValueOnce(existingUser);

        const updateDto: UpdateUserDto = {
          newEmail: 'existing@example.com',
        };

        await expect(service.update(userId, updateDto)).rejects.toThrow(
          UnprocessableEntityException,
        );
      });

      it('should throw when avatar file does not exist', async () => {
        filesService.update.mockResolvedValueOnce(null);

        const updateDto: UpdateUserDto = {
          avatar: { id: 'invalid-file-id' } as any,
        };

        await expect(service.update(userId, updateDto)).rejects.toThrow(
          UnprocessableEntityException,
        );
      });
    });

    describe('Edge Cases', () => {
      it('should allow updating email to same email', async () => {
        usersRepository.findByEmail.mockResolvedValueOnce(mockUser);

        const updateDto: UpdateUserDto = {
          email: mockUser.email,
        };

        await service.update(userId, updateDto);

        expect(usersRepository.update).toHaveBeenCalled();
      });

      it('should handle user not found gracefully', async () => {
        usersRepository.findById.mockResolvedValueOnce(null);

        const updateDto: UpdateUserDto = {
          fullName: 'Updated Name',
        };

        const result = await service.update(userId, updateDto);

        expect(usersRepository.update).toHaveBeenCalled();
        expect(result).toEqual(mockUser);
      });
    });
  });

  describe('validateEmail', () => {
    const email = 'test@example.com';
    const excludeId = 'user-123';

    describe('Success Cases', () => {
      it('should not throw when email does not exist', async () => {
        usersRepository.findByEmail.mockResolvedValueOnce(null);

        await expect(
          service.validateEmail(email, excludeId),
        ).resolves.not.toThrow();

        expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
      });

      it('should not throw when email belongs to the same user', async () => {
        const user = {
          ...mockUser,
          id: excludeId,
          email: email,
        };

        usersRepository.findByEmail.mockResolvedValueOnce(user);

        await expect(
          service.validateEmail(email, excludeId),
        ).resolves.not.toThrow();

        expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
      });
    });

    describe('Error Cases', () => {
      it('should throw when email exists for different user', async () => {
        const existingUser = {
          ...mockUser,
          id: 'different-user-id',
          email: email,
        };

        usersRepository.findByEmail.mockResolvedValueOnce(existingUser);

        await expect(service.validateEmail(email, excludeId)).rejects.toThrow(
          UnprocessableEntityException,
        );
      });
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';

    it('should return user when email exists', async () => {
      usersRepository.findByEmail.mockResolvedValueOnce(mockUser);

      const result = await service.findByEmail(email);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should return null when email does not exist', async () => {
      usersRepository.findByEmail.mockResolvedValueOnce(null);

      const result = await service.findByEmail(email);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    const userId = 'user-123';

    it('should return user when id exists', async () => {
      usersRepository.findById.mockResolvedValueOnce(mockUser);

      const result = await service.findById(userId);

      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when id does not exist', async () => {
      usersRepository.findById.mockResolvedValueOnce(null);

      const result = await service.findById(userId);

      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });
});
