import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';

export class AuthRegisterDto extends PickType(CreateUserDto, [
  'fullName',
  'email',
  'password',
]) {}
