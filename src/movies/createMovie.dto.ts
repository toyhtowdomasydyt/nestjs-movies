import {
  IsNotEmpty,
  IsIn,
  IsString,
  IsInt,
  Max,
  Min,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Transform, plainToClass } from 'class-transformer';
import { ERROR_CODES } from 'src/gateway/exception.filter';

export type MovieFormat = 'VHS' | 'DVD' | 'Blu-ray';
export const movieFormats: Array<MovieFormat> = ['VHS', 'DVD', 'Blu-ray'];

class Actor {
  @IsString()
  @Matches(/^[a-z\s-]+$/i)
  @IsNotEmpty()
  name: string;
}

export class CreateMovieDTO {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Max(2100, { message: ERROR_CODES.MOVIE_YEAR_LESS_THAN_2100 })
  @Min(1900, { message: ERROR_CODES.MOVIE_YEAR_BIGGER_THAN_1900 })
  @IsNotEmpty()
  year: number;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsIn(movieFormats)
  @IsNotEmpty()
  format: MovieFormat;

  @Transform(({ value }) =>
    value.map((name: string) => plainToClass(Actor, { name })),
  )
  @ValidateNested({ each: true })
  actors?: Array<Actor>;
}
