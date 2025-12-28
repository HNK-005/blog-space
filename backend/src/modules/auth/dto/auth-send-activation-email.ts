import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { PickType } from '@nestjs/swagger';

export class AuthSendActivationEmailDto extends PickType(CreateUserDto, [
  'email',
]) {}
