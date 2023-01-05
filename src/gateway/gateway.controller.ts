import {
  Controller,
  Post,
  HttpCode,
  Body,
  UseGuards,
  Request,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { UsersService } from 'src/users/users.service';
// import { DatabaseError, ValidationError } from 'sequelize';

@Controller('v1')
export class GatewayController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('users')
  @HttpCode(201)
  async create(@Body() userData) {
    try {
      const { email, name, password, confirmPassword } = userData;

      if (password !== confirmPassword) {
        throw new BadRequestException();
      }

      const user = await this.userService.create({ email, name, password });
      const { token } = this.authService.login({
        id: user.id,
        email: user.email,
      });

      return {
        token,
        status: 1,
      };
    } catch (error: unknown) {
      // if (error instanceof ValidationError) {
      //   const description = error.errors.map((validationError) => ({
      //     error: {
      //       fields: {
      //         [validationError.path]:
      //           validationError.validatorKey.toUpperCase(),
      //       },
      //     },
      //     code: `${validationError.path.toUpperCase()}_NOT_UNIQUE`,
      //   }));

      //   console.dir(description, { depth: null });
      // }

      if (!(error instanceof BadRequestException)) {
        throw new BadRequestException();
      }

      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('sessions')
  async login(@Request() req) {
    const user = req.user;
    const { token } = this.authService.login({
      id: user.id,
      email: user.email,
    });

    return {
      token,
      status: 1,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/protected')
  async protected() {
    return { protected: true };
  }
}
