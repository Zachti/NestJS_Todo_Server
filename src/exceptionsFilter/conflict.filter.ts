import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(ConflictException)
export class CustomConflictExceptionFilter implements ExceptionFilter {
  catch(exception: ConflictException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message;

      response.status(status).json({
        statusCode: status,
        errorMessage: message,
      });
    }
  }
}
