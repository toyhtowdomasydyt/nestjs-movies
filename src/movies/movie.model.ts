import {
  Column,
  Model,
  Table,
  DataType,
  HasMany,
  Unique,
} from 'sequelize-typescript';
import { Actor } from './actor.model';

export interface MovieDTO {
  title: string;
  year: string;
  format: 'VHS' | 'DVD' | 'Blu-ray';
  actors: Array<string>;
}

@Table
export class Movie extends Model {
  @Unique
  @Column
  title: string;

  @Column(DataType.INTEGER)
  year: number;

  @Column(DataType.ENUM('VHS', 'DVD', 'Blu-ray'))
  format: 'VHS' | 'DVD' | 'Blu-ray';

  @HasMany(() => Actor, { onDelete: 'cascade' })
  actors: Actor[];
}
