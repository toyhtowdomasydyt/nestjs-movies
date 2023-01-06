import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DomainException, ERROR_CODES } from 'src/gateway/exception.filter';

interface JwtPayload {
  sub?: string;
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email) {
      throw new DomainException(HttpStatus.UNAUTHORIZED, {
        error: {
          fields: {
            token: 'REQUIRED',
          },
          code: ERROR_CODES.FORMAT_ERROR,
        },
      });
    }

    const { sub: userID, email } = payload;
    const user = await this.authService.validateJWTUser({ id: userID, email });

    if (!user) {
      throw new DomainException(HttpStatus.UNAUTHORIZED, {
        error: {
          fields: {
            token: 'REQUIRED',
          },
          code: ERROR_CODES.FORMAT_ERROR,
        },
      });
    }

    return user;
  }
}
