import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/modules/user/domain/user';
import { FileType } from '@/modules/file/domain/file';
import { Exclude } from 'class-transformer';
import { Tag } from '@/modules/tag/domain/tag.domain';

export class Post {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'My First Post',
  })
  title: string;

  @ApiProperty({
    type: String,
    example: 'A short description of the post.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: [FileType],
    required: false,
  })
  images: FileType[];

  @ApiProperty({
    type: String,
    example: 'This is the content of my first post.',
  })
  content: string;

  @ApiProperty({
    type: () => FileType,
    nullable: true,
    required: false,
  })
  banner?: FileType | null;

  @ApiProperty({
    type: [Tag],
    example: ['nestjs', 'typescript'],
    required: false,
  })
  tags?: Tag[];

  @ApiProperty({
    type: Boolean,
    example: false,
    required: false,
  })
  draft?: boolean;

  @ApiProperty({
    type: () => User,
  })
  author: User;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  @Exclude({ toPlainOnly: true })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    required: false,
  })
  @Exclude({ toPlainOnly: true })
  deletedAt?: Date;
}
