import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  public readonly error_code: string;

  constructor(
    error_code: string,
    error_message: string,
    http_status: number = HttpStatus.BAD_REQUEST,
    details?: any,
  ) {
    super(
      {
        success: false,
        error: {
          error_code,
          error_message,
          http_status,
          details,
        },
      },
      http_status,
    );
    this.error_code = error_code;
  }
}
