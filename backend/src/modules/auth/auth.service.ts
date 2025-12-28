import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../mailer/mailer.service';
import { AuthRegisterDto } from './dto/auth-register-login.dto';
import { RoleEnum, StatusEnum } from '../user/user.enum';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/common/configs/config.type';
import { User } from '../user/domain/user';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async register(dto: AuthRegisterDto): Promise<void> {
    const user = await this.userService.create({
      ...dto,
      role: RoleEnum.USER,
      status: StatusEnum.INACTIVE,
    });

    await this.sendActivationEmail(user.email);
  }

  async confirmEmail(hash: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw new UnauthorizedException('Invalid hash');
    }

    const user = await this.userService.findById(userId);

    if (!user || user?.status !== StatusEnum.INACTIVE) {
      throw new NotFoundException('User not found');
    }

    user.status = StatusEnum.ACTIVE;

    await this.userService.update(user.id, user);
  }

  async sendActivationEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user || user?.status !== StatusEnum.INACTIVE) {
      throw new NotFoundException('User not found');
    }

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

    await this.mailerService.activationEmail({
      to: email,
      data: {
        hash,
      },
    });
  }
}
