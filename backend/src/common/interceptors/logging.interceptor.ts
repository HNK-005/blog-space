import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export default class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();
    const message = (status: number) =>
      `[${method}] ${url} -> ${status} - ${Date.now() - now}ms`;

    return next.handle().pipe(
      tap({
        next: (res) => {
          const statusCode = res.statusCode;
          this.logger.log(message(statusCode));
        },
        error: (err) => {
          const statusCode =
            err instanceof HttpException ? err.getStatus() : err.status || 500;
          if (statusCode < 500) {
            this.logger.warn(message(statusCode));
          } else {
            this.logger.error(message(statusCode));
            this.logger.error(err);
          }
        },
      }),
    );
  }
}
