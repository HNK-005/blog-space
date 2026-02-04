import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest/lib/mocks';
import { FileRepository } from './file.repository';
import { FileType } from './domain/file';
import { FileStatusEnum } from './file.enum';

describe('FileService', () => {
  let fileService: FileService;
  let mockFileRepository: DeepMocked<FileRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          useValue: createMock<FileRepository>(),
          provide: FileRepository,
        },
      ],
    }).compile();

    fileService = module.get<FileService>(FileService);
    mockFileRepository = module.get(FileRepository);
  });

  it('should be defined', () => {
    expect(fileService).toBeDefined();
    expect(mockFileRepository).toBeDefined();
  });

  it('should create a file', async () => {
    const mockFile: FileType = {
      id: expect.any(String),
      path: 'http://example.com/file.jpg',
      status: FileStatusEnum.UPLOADED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFileRepository.create.mockResolvedValue(mockFile);

    const createdFile = await fileService.create(mockFile);

    expect(createdFile).toEqual(mockFile);
  });

  it('should update a file', async () => {
    const fileId = 'file-id-123';
    const updatePayload: Partial<FileType> = {
      status: FileStatusEnum.USED,
    };
    const updatedFile: FileType = {
      id: fileId,
      status: FileStatusEnum.USED,
      path: 'http://example.com/file.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFileRepository.update.mockResolvedValue(updatedFile);

    const result = await fileService.update(fileId, updatePayload);

    expect(result).toEqual(updatedFile);
  });
});
