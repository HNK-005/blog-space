import { Test, TestingModule } from '@nestjs/testing';
import { FileLocalController } from './file.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest/lib/mocks';
import { FileLocalService } from './file.service';

describe('FileLocalController', () => {
  let controller: FileLocalController;
  let mockFileLocalService: DeepMocked<FileLocalService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileLocalController],
      providers: [
        {
          useValue: createMock<FileLocalService>(),
          provide: FileLocalService,
        },
      ],
    }).compile();

    controller = module.get<FileLocalController>(FileLocalController);
    mockFileLocalService = module.get(FileLocalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(mockFileLocalService).toBeDefined();
  });

  it('should upload a file', async () => {
    mockFileLocalService.create.mockResolvedValue({
      file: {
        id: expect.any(String),
        path: expect.any(String),
        status: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    });

    const result = await controller.uploadFile({
      fieldname: expect.any(String),
      originalname: expect.any(String),
      encoding: expect.any(String),
      mimetype: expect.any(String),
      size: expect.any(Number),
      buffer: Buffer.from([]),
      path: expect.any(String),
      stream: null as any,
      destination: expect.any(String),
      filename: expect.any(String),
    });

    expect(result).toEqual({
      file: {
        id: expect.any(String),
        path: expect.any(String),
        status: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    });
  });

  it('should download a file', () => {
    const mockResponse = {
      sendFile: jest.fn(),
    };

    controller.download('test-path', mockResponse as any);

    expect(mockResponse.sendFile).toHaveBeenCalledWith('test-path', {
      root: './files',
    });
  });

  it('should throw error when upload fails', async () => {
    mockFileLocalService.create.mockRejectedValue(new Error('Upload failed'));

    await expect(
      controller.uploadFile({
        fieldname: expect.any(String),
        originalname: expect.any(String),
        encoding: expect.any(String),
        mimetype: expect.any(String),
        size: expect.any(Number),
        buffer: Buffer.from([]),
        path: expect.any(String),
        stream: null as any,
        destination: expect.any(String),
        filename: expect.any(String),
      }),
    ).rejects.toThrow('Upload failed');
  });
});
