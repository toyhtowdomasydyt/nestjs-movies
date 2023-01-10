import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ERROR_CODES } from 'src/gateway/exception.filter';

@ValidatorConstraint({ name: 'CustomMatchPasswords', async: false })
export class CustomMatchPasswords implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (password !== args.object[args.constraints[0]]) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'Passwords do not match!';
  }
}

export class CreateUserDTO {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsEmail()
  @IsNotEmpty({
    message: ERROR_CODES.EMAIL_IS_REQUIRED,
  })
  email: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({
    message: ERROR_CODES.NAME_IS_REQUIRED,
  })
  name: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({
    message: ERROR_CODES.PASSWORD_IS_REQUIRED,
  })
  password: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Validate(CustomMatchPasswords, ['password'], {
    message: ERROR_CODES.CONFIRM_PASSWORD_NOT_MATCH,
  })
  @IsNotEmpty({ message: ERROR_CODES.CONFIRM_PASSWORD_IS_REQUIRED })
  confirmPassword: string;
}
