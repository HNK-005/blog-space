import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthSendActivationEmailDto } from './dto/auth-send-activation-email';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response';
import { AuthLoginInterceptor } from './interceptor/auth-login.interceptor';
@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('email/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() registerDto: AuthRegisterDto): Promise<void> {
    return this.service.register(registerDto);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }

  @Post('email/send-activation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendActivationEmail(
    @Body() sendActivationEmailDto: AuthSendActivationEmailDto,
  ): Promise<void> {
    return this.service.sendActivationEmail(sendActivationEmailDto.email);
  }

  @Post('email/login')
  @UseInterceptors(AuthLoginInterceptor)
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    return this.service.login(loginDto);
  }
}
