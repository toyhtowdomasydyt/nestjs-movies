import { Controller, Post, HttpCode, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @HttpCode(201)
  async create(@Body() createUserDTO: any) {
    const { email, name, password, confirmPassword } = createUserDTO;
    const user = await this.userService.create(email, name, password);

    return user;
  }
}
