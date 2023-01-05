import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, CreateUserDTO } from 'src/users/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async create(user: CreateUserDTO): Promise<User> {
    const passwordHash = await bcrypt.hash(user.password, 10);

    return this.userModel.create({
      email: user.email,
      name: user.name,
      password: passwordHash,
    });
  }

  findOne(email: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        email,
      },
    });
  }
}
