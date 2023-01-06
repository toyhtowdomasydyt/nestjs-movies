import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export const ERROR_CODES = {
  EMAIL_NOT_UNIQUE: 'EMAIL_NOT_UNIQUE',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  MOVIE_EXISTS: 'MOVIE_EXISTS',
  FORMAT_ERROR: 'FORMAT_ERROR',
  MOVIE_NOT_FOUND: 'MOVIE_NOT_FOUND',
  ITERNAL_SERVER_ERROR: 'ITERNAL_SERVER_ERROR',
};

export class DomainException extends Error {
  public status: number;
  public name: string;
  public errorDescription: Record<string, unknown>;

  constructor(status: number, errorDescription) {
    super();

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.status = status;
    this.errorDescription = errorDescription;
  }
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof DomainException) {
      const status = exception.status;
      const description = exception.errorDescription;

      response.status(status).json({
        status: 0,
        error: description,
      });
      return;
    }

    if (exception.name === 'UnauthorizedException') {
      response.status(HttpStatus.UNAUTHORIZED).json({
        status: 0,
        error: {
          fields: {
            token: 'REQUIRED',
          },
          code: ERROR_CODES.FORMAT_ERROR,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: 0,
      error: {
        code: ERROR_CODES.ITERNAL_SERVER_ERROR,
      },
    });
  }
}
