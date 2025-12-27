import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { FileRepository } from './file.repository';
import { mockFileRepository } from './__mock__/file.repository.mock';
import { FileType } from './domain/file';
import { FileStatusEnum } from './file.enum';

describe('FileService', () => {
  let service: FileService;
  let repository: FileRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: FileRepository,
          useValue: mockFileRepository,
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    repository = module.get<FileRepository>(FileRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the file domain', () => {
    const mockFile: FileType = {
      id: '1',
      path: '/path/to/file',
      status: FileStatusEnum.UPLOADED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFileRepository.create.mockResolvedValue(mockFile);

    return expect(service.create(mockFile)).resolves.toStrictEqual(mockFile);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });
});
