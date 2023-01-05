import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  create(email: string, name: string, password: string): Promise<User> {
    return this.userModel.create({
      email,
      name,
      password,
    });
  }
}
