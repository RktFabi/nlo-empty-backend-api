import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    // If it's already ApiException → just return it
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return res.status(exception.getStatus()).send(response);
    }
    if (exception instanceof BadRequestException) {
      // Let ApiValidationPipe take care of validation formatting
      throw exception;
    }
    // Otherwise → wrap unexpected error
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        error_code: 'ERR_INTERNAL_UNEXPECTED',
        error_message: 'An unexpected error occurred.',
        http_status: HttpStatus.INTERNAL_SERVER_ERROR,
        details: exception?.message,
      },
    });
  }
}
