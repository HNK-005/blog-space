import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@/modules/file/domain/file';

export class FileResponseDto {
  @ApiProperty({
    type: () => FileType,
  })
  file: FileType;
}
