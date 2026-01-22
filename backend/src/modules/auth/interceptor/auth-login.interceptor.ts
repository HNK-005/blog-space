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
import { APP_ENVIRONMENT } from '@/common/constants/app.enum';

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

          const secure = env === APP_ENVIRONMENT.PRODUCTION ? true : false;
          const sameSite = env === APP_ENVIRONMENT.PRODUCTION ? 'none' : 'lax';

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
