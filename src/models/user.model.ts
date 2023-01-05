import {
  Column,
  Default,
  PrimaryKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

@Table
export class User extends Model {
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id: string;

  @Column
  email: string;

  @Column
  name: string;

  @Column
  password: string;
}
