import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    // import modules, etc.
  ],
  controllers: [],
  providers: [UserService, UserRepository],
})
export class UserModule {}
