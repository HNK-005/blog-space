import { Post } from '@/modules/post/domain/post';
import { User } from '@/modules/user/domain/user';
import { ApiProperty } from '@nestjs/swagger';

export class Comments {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, required: true })
  content: string;

  @ApiProperty({ type: () => User, required: true })
  user: User;

  @ApiProperty({ type: () => Post, required: true })
  post: Post;

  @ApiProperty({ type: () => Comments, required: false })
  parent?: Comments;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date, required: false })
  deletedAt?: Date;
}
