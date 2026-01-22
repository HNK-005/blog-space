import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../mailer/mailer.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { RoleEnum, StatusEnum } from '../user/user.enum';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/common/configs/config.type';
import { User } from '../user/domain/user';
import { AuthLoginResponseDto } from './dto/auth-login-response';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthProvidersEnum } from './auth.enum';
import { Session } from '../session/domain/session';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

import ms from 'ms';
import crypto from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
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

  async login(dto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    const { email, password } = dto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.provider !== AuthProvidersEnum.EMAIL) {
      throw new UnprocessableEntityException({
        errors: {
          email: `Please login with ${user.provider}`,
        },
      });
    }

    const isPasswordValid = await this.userService.comparePassword(
      password,
      user,
    );

    if (!isPasswordValid) {
      throw new UnprocessableEntityException({
        errors: {
          password: 'Incorrect password',
        },
      });
    }
    const session = await this.createUserSession(user);

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
      refreshTokenExpires,
    } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash: session.hash,
    });

    return {
      metaData: {
        accessToken: {
          token: jwtToken,
          expires: new Date(tokenExpires),
        },
        refreshToken: {
          token: refreshToken,
          expires: new Date(refreshTokenExpires),
        },
      },
      fullName: user.fullName,
      username: user.username,
      avatar: user.avatar,
    };
  }

  private async createUserSession(user: User): Promise<Session> {
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      user,
      hash,
    });

    return session;
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const refreshTokenExpiresIn = this.configService.getOrThrow(
      'auth.refreshExpires',
      {
        infer: true,
      },
    );

    const tokenExpires = Date.now() + ms(tokenExpiresIn);
    const refreshTokenExpires = Date.now() + ms(refreshTokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
      refreshTokenExpires,
    };
  }
}
