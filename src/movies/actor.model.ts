import {
  Column,
  Table,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Movie } from './movie.model';

@Table
export class Actor extends Model {
  @Column
  name: string;

  @ForeignKey(() => Movie)
  @Column
  movieId: number;

  @BelongsTo(() => Movie)
  movie: Movie;
}
