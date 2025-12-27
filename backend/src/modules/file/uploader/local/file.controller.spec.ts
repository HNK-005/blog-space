import { Test, TestingModule } from '@nestjs/testing';
import { FileLocalController } from './file.controller';
import { FileLocalService } from './file.service';
import { FileResponseDto } from './dto/file-response.dto';
import { FileStatusEnum } from '../../file.enum';

describe('FileLocalController', () => {
  let controller: FileLocalController;
  let service: FileLocalService;

  const mockFileService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileLocalController],
      providers: [
        {
          provide: FileLocalService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    controller = module.get<FileLocalController>(FileLocalController);
    service = module.get<FileLocalService>(FileLocalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file and return the response dto', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        filename: 'unique-test.jpg',
        path: 'files/unique-test.jpg',
      } as Express.Multer.File;

      const expectedResult: FileResponseDto = {
        file: {
          id: expect.any(String),
          path: 'files/unique-test.jpg',
          status: FileStatusEnum.UPLOADED,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      };

      mockFileService.create.mockResolvedValue(expectedResult);

      const result = await controller.uploadFile(mockFile);

      expect(service.create).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('download', () => {
    it('should call response.sendFile with correct parameters', () => {
      const path = 'test-image.jpg';
      const mockResponse = {
        sendFile: jest.fn(),
      };

      controller.download(path, mockResponse);

      expect(mockResponse.sendFile).toHaveBeenCalledWith(path, {
        root: './files',
      });
    });
  });
});
