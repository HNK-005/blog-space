import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { MailerModule } from '../mailer/mailer.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    // import modules, etc.
    UserModule,
    MailerModule,
    SessionModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
