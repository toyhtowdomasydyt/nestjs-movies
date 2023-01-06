import { HttpStatus } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DomainException, ERROR_CODES } from 'src/gateway/exception.filter';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateLocalUser({ email, password });

    if (!user) {
      throw new DomainException(HttpStatus.UNAUTHORIZED, {
        error: {
          fields: {
            email: ERROR_CODES.AUTHENTICATION_FAILED,
            password: ERROR_CODES.AUTHENTICATION_FAILED,
          },
          code: ERROR_CODES.AUTHENTICATION_FAILED,
        },
      });
    }

    return user;
  }
}
