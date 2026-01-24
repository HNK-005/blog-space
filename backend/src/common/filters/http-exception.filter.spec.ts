import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let host: DeepMocked<ArgumentsHost>;
  let request: DeepMocked<Request>;
  let response: DeepMocked<Response>;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    // 1. Tạo mock cho Request và Response
    request = createMock<Request>();
    response = createMock<Response>();

    // 2. Setup quan trọng cho Express Chaining: response.status().json()
    // createMock đã tạo spy cho .status(), ta chỉ cần bảo nó trả về 'this' (chính là response mock)
    response.status.mockReturnThis();

    // 3. Setup dữ liệu request cơ bản
    request.url = '/api/test';
    request.method = 'POST';

    // 4. Tạo mock cho ArgumentsHost
    host = createMock<ArgumentsHost>();
    const httpHost = createMock<HttpArgumentsHost>();

    // Gắn kết các mock lại với nhau
    host.switchToHttp.mockReturnValue(httpHost);
    httpHost.getRequest.mockReturnValue(request);
    httpHost.getResponse.mockReturnValue(response);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  // --- Test Case 1: Lỗi HttpException cơ bản ---
  it('should catch HttpException and return formatted JSON', () => {
    const exception = new BadRequestException('Something went wrong');

    filter.catch(exception, host);

    // Kiểm tra status code được set đúng
    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    // Kiểm tra json body trả về
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Something went wrong',
      errors: undefined,
      path: '/api/test',
      method: 'POST',
      timestamp: expect.any(String),
    });
  });

  // --- Test Case 2: Lỗi Validation (Response là Object) ---
  it('should handle exception with object response (e.g. ValidationPipe)', () => {
    const validationResponse = {
      message: 'Validation failed',
      errors: { email: 'Invalid email' },
      statusCode: 400,
    };
    const exception = new BadRequestException(validationResponse);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Validation failed',
        errors: { email: 'Invalid email' },
      }),
    );
  });

  // --- Test Case 3: Lỗi hệ thống (Generic Error) ---
  it('should handle generic Error and return 500', () => {
    const exception = new Error('Database connection failed');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database connection failed',
        path: '/api/test',
      }),
    );
  });
});
