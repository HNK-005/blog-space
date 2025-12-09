import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import deepResolvePromises from '../utils/deep-resolver';

@Injectable()
export default class ResolvePromisesInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(mergeMap((data) => deepResolvePromises(data)));
  }
}
