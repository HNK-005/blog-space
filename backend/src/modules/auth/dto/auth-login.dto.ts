import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { IsNotEmpty } from 'class-validator';

export class AuthLoginDto extends PickType(CreateUserDto, ['email']) {
  @ApiProperty({ type: String, example: 'test123' })
  @IsNotEmpty()
  password: string;
}
