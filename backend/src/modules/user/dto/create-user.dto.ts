import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';
import { lowerCaseTransformer } from '@/common/utils/lower-case';
import { AuthProvidersEnum } from '@/modules/auth/auth.enum';
import { FileDto } from '@/modules/file/dto/file.dto';
import { RoleEnum, StatusEnum } from '../user.enum';

export const nameRegex = /^[A-Za-zÀ-ỹ]+(?:[ '-][A-Za-zÀ-ỹ]+)*$/;

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'test123', type: String })
  @MinLength(6)
  password?: string;

  @ApiProperty({ enum: AuthProvidersEnum, example: AuthProvidersEnum.EMAIL })
  @IsEnum(AuthProvidersEnum)
  provider?: AuthProvidersEnum;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  username?: string;

  @ApiProperty({ example: 'John Doe', type: String })
  @Matches(nameRegex)
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  avatar?: FileDto | null;

  @ApiProperty({ enum: RoleEnum, example: RoleEnum.USER })
  @IsEnum(RoleEnum)
  role?: RoleEnum;

  @ApiProperty({ enum: StatusEnum, example: StatusEnum.INACTIVE })
  @IsEnum(StatusEnum)
  status?: StatusEnum;
}
