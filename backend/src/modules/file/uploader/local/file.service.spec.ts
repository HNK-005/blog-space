import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnprocessableEntityException } from '@nestjs/common';
import { FileLocalService } from './file.service';
import { FileService } from '../../file.service';
import { FileType } from '@/modules/file/domain/file';
import { mockFileService } from '../../__mock__/file.service.mock';

describe('FileLocalService', () => {
  let service: FileLocalService;
  let fileService: FileService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'app.backendDomain') return 'http://localhost:3000';
      if (key === 'app.apiPrefix') return 'api';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileLocalService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    service = module.get<FileLocalService>(FileLocalService);
    fileService = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(fileService).toBeDefined();
  });

  describe('create', () => {
    it('should throw UnprocessableEntityException if file is missing', async () => {
      await expect(service.create(undefined as any)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should return a file object with the correct path', async () => {
      const mockMulterFile = {
        path: 'uploads/test.jpg',
      } as Express.Multer.File;

      const mockFileType: FileType = {
        id: '1',
        path: 'http://localhost:3000/api/v1/uploads/test.jpg',
      } as FileType;

      mockFileService.create.mockResolvedValue(mockFileType);

      const result = await service.create(mockMulterFile);

      expect(result).toEqual({ file: mockFileType });
      expect(mockFileService.create).toHaveBeenCalledWith({
        path: 'http://localhost:3000/api/v1/uploads/test.jpg',
      });
    });
  });
});
