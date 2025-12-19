import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'File ID is required' })
  id: string;

  path: string;
}
