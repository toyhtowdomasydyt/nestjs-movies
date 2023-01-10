import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const validatePipeOptions = {
  whitelist: true,
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    return new BadRequestException(validationErrors);
  },
  transform: true,
};
