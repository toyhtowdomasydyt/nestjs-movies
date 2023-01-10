import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/user.model';
import { CreateUserDTO } from './createUser.dto';
import * as bcrypt from 'bcrypt';
import { ValidationError } from 'sequelize';
import { DomainException, ERROR_CODES } from 'src/gateway/exception.filter';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async create(user: CreateUserDTO): Promise<User> {
    try {
      const passwordHash = await bcrypt.hash(user.password, 10);

      return await this.userModel.create({
        email: user.email,
        name: user.name,
        password: passwordHash,
      });
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        const validationErrorItem = error.errors[0];
        const description = {
          fields: {
            [validationErrorItem.path]:
              validationErrorItem.validatorKey.toUpperCase(),
          },
          code: ERROR_CODES.EMAIL_NOT_UNIQUE,
        };
        throw new DomainException(HttpStatus.BAD_REQUEST, description);
      }

      throw error;
    }
  }

  findOne(email: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        email,
      },
    });
  }
}
