import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthSendActivationEmailDto } from './dto/auth-send-activation-email';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response';
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
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: AuthLoginDto,
  ): Promise<AuthLoginResponseDto> {
    return this.service.login(res, loginDto);
  }
}
