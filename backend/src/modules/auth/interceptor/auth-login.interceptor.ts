import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthLoginResponseDto } from '../dto/auth-login-response';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/common/configs/config.type';
import { Response } from 'express';

@Injectable()
export class AuthLoginInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: AuthLoginResponseDto) => {
        const { metaData, ...newData } = data;

        if (metaData) {
          const { accessToken, refreshToken } = metaData;
          const env = this.configService.getOrThrow('app.nodeEnv', {
            infer: true,
          });

          const secure = env === 'production' ? true : false;
          const sameSite = env === 'production' ? 'none' : 'lax';

          res.cookie('accessToken', accessToken.token, {
            httpOnly: true,
            secure: secure,
            sameSite: sameSite,
            expires: new Date(accessToken.expires),
          });

          res.cookie('refreshToken', refreshToken.token, {
            httpOnly: true,
            secure: secure,
            sameSite: sameSite,
            expires: new Date(refreshToken.expires),
          });
        }

        return newData;
      }),
    );
  }
}
