import { User } from '@/modules/user/domain/user';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class Follow {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: () => User,
  })
  followerId: User;

  @ApiProperty({
    type: () => User,
  })
  followingId: User;

  @Exclude({ toPlainOnly: true })
  createdAt: Date;

  @Exclude({ toPlainOnly: true })
  updatedAt: Date;

  @Exclude({ toPlainOnly: true })
  deletedAt?: Date;
}
