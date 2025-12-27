import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../mailer/mailer.service';
import { AuthRegisterDto } from './dto/auth-register-login.dto';
import { RoleEnum, StatusEnum } from '../user/user.enum';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/common/configs/config.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
  ) {}

  async register(dto: AuthRegisterDto): Promise<void> {
    const user = await this.userService.create({
      ...dto,
      role: RoleEnum.USER,
      status: StatusEnum.INACTIVE,
    });

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    );

    await this.mailService.activationEmail({
      to: dto.email,
      data: {
        hash,
      },
    });
  }
}
