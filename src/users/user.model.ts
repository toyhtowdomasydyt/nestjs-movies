import {
  Column,
  Default,
  PrimaryKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

export interface UserDTO {
  id: string;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

@Table
export class User extends Model {
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id: string;

  @Unique
  @Column
  email: string;

  @Column
  name: string;

  @Column
  password: string;
}
