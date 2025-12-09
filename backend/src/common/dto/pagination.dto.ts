import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto<T> {
  @ApiProperty({ isArray: true })
  docs: T[];

  @ApiProperty({ example: 100 })
  totalDocs: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPrevPage: boolean;

  @ApiProperty({ example: null })
  prevPage: number | null;

  @ApiProperty({ example: 2 })
  nextPage: number | null;
}
