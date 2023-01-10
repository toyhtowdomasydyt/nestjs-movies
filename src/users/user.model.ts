import {
  Column,
  Default,
  PrimaryKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

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
