import { User } from '@/modules/user/domain/user';
import { PickType } from '@nestjs/swagger';

export class AuthLoginResponseDto extends PickType(User, [
  'fullName',
  'username',
  'avatar',
]) {
  metaData: {
    accessToken: {
      token: string;
      expires: Date;
    };
    refreshToken: {
      token: string;
      expires: Date;
    };
  };
}
