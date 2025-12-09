import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, any>;
  path: string;
  method: string;
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '';
    let errors: Record<string, any> | undefined = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse() as
        | string
        | { message?: any; errors?: any; statusCode?: number };

      if (typeof res === 'string') {
        message = res;
      } else {
        message = res.message ?? message;
        errors = res.errors ?? undefined;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const responseBody: ErrorResponse = {
      statusCode,
      message,
      errors,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(responseBody);
  }
}
