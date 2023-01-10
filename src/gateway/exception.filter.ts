import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import { reverseFieldMap } from 'src/movies/importMovie.utils';

interface ExceptionResponse {
  statusCode: number;
  message: Array<Record<string, unknown>>;
  error: string;
}

const USER_ERROR_CODES = {
  EMAIL_NOT_UNIQUE: 'EMAIL_NOT_UNIQUE',
  EMAIL_IS_REQUIRED: 'EMAIL_IS_REQUIRED',
  NAME_IS_REQUIRED: 'NAME_IS_REQUIRED',
  PASSWORD_IS_REQUIRED: 'PASSWORD_IS_REQUIRED',
  CONFIRM_PASSWORD_IS_REQUIRED: 'CONFIRM_PASSWORD_IS_REQUIRED',
  CONFIRM_PASSWORD_NOT_MATCH: 'CONFIRM_PASSWORD_NOT_MATCH',
};

const AUTH_ERROR_CODES = {
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
};

const MOVIE_ERROR_CODES = {
  MOVIE_EXISTS: 'MOVIE_EXISTS',
  MOVIE_YEAR_BIGGER_THAN_1900: 'MOVIE_YEAR_BIGGER_THAN_1900',
  MOVIE_YEAR_LESS_THAN_2100: 'MOVIE_YEAR_LESS_THAN_2100',
  MALFORMED_REQUEST: 'MALFORMED_REQUEST',
  MOVIE_NOT_FOUND: 'MOVIE_NOT_FOUND',
  PLAIN_TXT_FILE_REQUIRED: 'PLAIN_TXT_FILE_REQUIRED',
};

export const ERROR_CODES = {
  ...USER_ERROR_CODES,
  ...AUTH_ERROR_CODES,
  ...MOVIE_ERROR_CODES,
  FORMAT_ERROR: 'FORMAT_ERROR',
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

const handleDomainException = (
  exception: DomainException,
  response: Response,
) => {
  const status = exception.status;
  const description = exception.errorDescription;

  response.status(status).json({
    status: 0,
    error: description,
  });
  return;
};

const handleUnauthorizedException = (exception, response: Response) => {
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
};

const handleBadRequestException = (
  exception: BadRequestException,
  response: Response,
) => {
  const validationResponse = exception.getResponse() as ExceptionResponse;

  if (validationResponse.message[0] instanceof ValidationError) {
    const validationError: ValidationError = validationResponse.message[0];
    const errorMessage = validationError?.constraints
      ? ERROR_CODES[
          validationError.constraints[
            Object.keys(validationError?.constraints)[0]
          ]
        ] || ERROR_CODES.FORMAT_ERROR
      : ERROR_CODES.FORMAT_ERROR;

    response.status(HttpStatus.BAD_REQUEST).json({
      status: 0,
      error: {
        fields: {
          [validationError.property]: errorMessage,
        },
        code: ERROR_CODES.MALFORMED_REQUEST,
      },
    });
    return;
  }

  response.status(HttpStatus.BAD_REQUEST).json({
    status: 0,
    error: {
      code: ERROR_CODES.MALFORMED_REQUEST,
    },
  });
};

const handleValidationException = (
  exception: ValidationError,
  response: Response,
) => {
  const validationError = exception[0];
  response.status(HttpStatus.BAD_REQUEST).json({
    status: 0,
    error: {
      fields: {
        [reverseFieldMap[validationError.property]]: ERROR_CODES.FORMAT_ERROR,
      },
      code: ERROR_CODES.MALFORMED_REQUEST,
    },
  });
  return;
};

const handleOthersException = (exception: Error, response: Response) => {
  response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: 0,
    error: {
      code: ERROR_CODES.ITERNAL_SERVER_ERROR,
    },
  });
};

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    try {
      if (exception instanceof DomainException) {
        return handleDomainException(exception, response);
      }

      if (exception.name === 'UnauthorizedException') {
        return handleUnauthorizedException(exception, response);
      }

      if (exception instanceof BadRequestException) {
        return handleBadRequestException(exception, response);
      }

      if (exception[0] instanceof ValidationError) {
        return handleValidationException(exception[0], response);
      }

      return handleOthersException(exception, response);
    } catch (error: unknown) {
      return handleOthersException(error as Error, response);
    }
  }
}
