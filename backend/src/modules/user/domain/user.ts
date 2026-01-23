import { ApiProperty } from '@nestjs/swagger';
import { AuthProvidersEnum } from '@/modules/auth/auth.enum';
import { FileType } from '@/modules/file/domain/file';
import { RoleEnum, StatusEnum } from '../user.enum';
import { Exclude, Expose } from 'class-transformer';
import { SERIALIZATION_GROUP } from '@/common/constants/group.enum';

export class User {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  @Expose({ groups: [SERIALIZATION_GROUP.ME, SERIALIZATION_GROUP.ADMIN] })
  email: string;

  @ApiProperty({
    type: String,
    example: 'new.john.doe@example.com',
  })
  newEmail?: string;

  @ApiProperty({
    type: String,
  })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty({
    type: String,
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    type: String,
    example: 'A short bio about John Doe.',
  })
  bio?: string;

  @ApiProperty({
    type: Number,
    example: 20,
    default: 0,
  })
  postCount: number;

  @ApiProperty({
    type: Number,
    example: 20,
    default: 0,
  })
  commentCount: number;

  @ApiProperty({
    type: Number,
    example: 20,
    default: 0,
  })
  followerCount: number;

  @ApiProperty({
    type: Number,
    example: 20,
    default: 0,
  })
  followingCount: number;

  @ApiProperty({
    type: () => FileType,
    nullable: true,
  })
  avatar?: FileType | null;

  @ApiProperty({
    type: String,
    example: AuthProvidersEnum.EMAIL,
  })
  provider: AuthProvidersEnum;

  @ApiProperty({ enum: RoleEnum, example: RoleEnum.USER })
  role?: RoleEnum;

  @ApiProperty({ enum: StatusEnum, example: StatusEnum.INACTIVE })
  status?: StatusEnum;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @Exclude({ toPlainOnly: true })
  updatedAt: Date;

  @Exclude({ toPlainOnly: true })
  deletedAt?: Date;
}
