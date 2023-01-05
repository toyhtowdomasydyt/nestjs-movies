import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface LocalUser {
  email: string;
  password: string;
}

interface JWTUser {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocalUser(localUser: LocalUser) {
    const user = await this.userService.findOne(localUser.email);

    if (user) {
      const passwordMatch = await bcrypt.compare(
        localUser.password,
        user.password,
      );

      if (passwordMatch) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    }

    return null;
  }

  async validateJWTUser(jwtUser: JWTUser) {
    const user = await this.userService.findOne(jwtUser.email);

    if (user && user.id === jwtUser.id) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }

    return null;
  }

  login(jwtUser: JWTUser) {
    const payload = { email: jwtUser.email, sub: jwtUser.id };

    return {
      token: this.jwtService.sign(payload),
    };
  }
}
