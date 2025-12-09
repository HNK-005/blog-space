import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ResponseDto } from '../dto/response.dto';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export default class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseDto<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;
        const message = this.reflector.get<string>(
          RESPONSE_MESSAGE_KEY,
          context.getHandler(),
        );

        return {
          statusCode,
          message,
          data,
        };
      }),
    );
  }
}
