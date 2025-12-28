import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, MaxLength } from 'class-validator';
import { lowerCaseTransformer } from '@/common/utils/lower-case';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'newtest1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  newEmail?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @MaxLength(200)
  bio?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  postCount?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  commentCount?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  followerCount?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  followingCount?: number;
}
