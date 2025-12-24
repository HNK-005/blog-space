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
