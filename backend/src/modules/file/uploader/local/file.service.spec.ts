import { Test, TestingModule } from '@nestjs/testing';
import { FileLocalService } from './file.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest/lib/mocks';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { FileService } from '../../file.service';
import { FileStatusEnum } from '../../file.enum';
import { UnprocessableEntityException } from '@nestjs/common/exceptions/unprocessable-entity.exception';

describe('FileLocalService', () => {
  let service: FileLocalService;
  let mockConfigService: DeepMocked<ConfigService>;
  let mockFileService: DeepMocked<FileService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileLocalService,
        {
          useValue: createMock<ConfigService>(),
          provide: ConfigService,
        },
        {
          useValue: createMock<FileService>(),
          provide: FileService,
        },
      ],
    }).compile();

    service = module.get<FileLocalService>(FileLocalService);
    mockConfigService = module.get(ConfigService);
    mockFileService = module.get(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mockConfigService).toBeDefined();
    expect(mockFileService).toBeDefined();
  });

  it('should create file successfully', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from([]),
      path: 'uploads/test-1234.png',
      stream: null as any,
      destination: '/uploads',
      filename: 'test-1234.png',
    };

    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      switch (key) {
        case 'app.backendDomain':
          return 'http://localhost:3000';
        case 'app.apiPrefix':
          return 'api';
        default:
          throw new Error(expect.any(String));
      }
    });

    mockFileService.create.mockResolvedValue({
      id: expect.any(String),
      path: 'http://localhost:3000/api/v1/uploads/test-1234.png',
      status: FileStatusEnum.UPLOADED,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const result = await service.create(mockFile);

    expect(mockConfigService.getOrThrow).toHaveBeenCalledTimes(2);
    expect(mockFileService.create).toHaveBeenCalledWith({
      path: 'http://localhost:3000/api/v1/uploads/test-1234.png',
    });

    expect(result).toHaveProperty('file');
    expect(result.file).toHaveProperty(
      'path',
      'http://localhost:3000/api/v1/uploads/test-1234.png',
    );
  });

  it('should throw UnprocessableEntityException when file is invalid', async () => {
    await expect(service.create(null as any)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw exception when config values are missing', async () => {
    const mockFile: Express.Multer.File = expect.any(Object);

    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      switch (key) {
        default:
          throw new Error(expect.any(String));
      }
    });

    expect(mockConfigService.getOrThrow).toHaveBeenCalledTimes(0);
    await expect(service.create(mockFile)).rejects.toThrow(Error);
  });
});
