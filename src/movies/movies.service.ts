import { Readable } from 'node:stream';
import * as readline from 'node:readline';
import * as events from 'node:events';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction, ValidationError } from 'sequelize';
import { Movie } from './movie.model';
import { CreateMovieDTO } from './createMovie.dto';
import { Actor } from './actor.model';
import { DomainException, ERROR_CODES } from 'src/gateway/exception.filter';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { parseByLine } from './importMovie.utils';
import { Sequelize } from 'sequelize-typescript';
import { sortMoviesAlphabetically } from './queryMovie.utils';

export interface MovieQueryOptions {
  limit: number;
  offset: number;
  sort: 'id' | 'title' | 'year';
  order: 'DESC' | 'ASC';
  actor: string;
  title: string;
  search: string;
}

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie) private readonly movieModel: typeof Movie,
    @InjectModel(Actor) private readonly actorModel: typeof Actor,
    private readonly sequelize: Sequelize,
  ) {}

  async create(movieData: CreateMovieDTO, t?: Transaction) {
    try {
      const movie = await this.movieModel.create(
        {
          title: movieData.title,
          year: movieData.year,
          format: movieData.format,
          actors: movieData.actors,
        },
        { include: Actor, transaction: t },
      );

      return movie;
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        const validationErrorItem = error.errors[0];
        const description = {
          fields: {
            [validationErrorItem.path]:
              validationErrorItem.validatorKey.toUpperCase(),
          },
          values: {
            [validationErrorItem.path]: validationErrorItem.value,
          },
          code: ERROR_CODES.MOVIE_EXISTS,
        };
        throw new DomainException(HttpStatus.BAD_REQUEST, description);
      }

      throw error;
    }
  }

  async findByID(id: number) {
    const movie = await this.movieModel.findOne({
      where: { id },
      include: Actor,
    });

    if (!movie) {
      throw new DomainException(HttpStatus.NOT_FOUND, {
        error: {
          fields: {
            id,
          },
          code: ERROR_CODES.MOVIE_NOT_FOUND,
        },
      });
    }

    return movie;
  }

  async deleteByID(id: number) {
    const movie = await this.findByID(id);

    await movie.destroy();
  }

  async update(id: number, movieData: CreateMovieDTO) {
    const movie = await this.findByID(id);

    movie.set({
      year: movieData.year,
      format: movieData.format,
      actors:
        movieData.actors && Array.isArray(movieData.actors)
          ? movieData.actors
          : movie.actors,
    });
    await movie.save();

    return movie;
  }

  async list(options: MovieQueryOptions) {
    const {
      limit = 20,
      offset = 0,
      sort = 'id',
      order = 'ASC',
      actor,
      title,
      search,
    } = options;

    const titleValue = title || search;
    const whereTitle = titleValue
      ? { '$movie.title$': { [Op.substring]: titleValue } }
      : {};

    const actorName = actor || search;
    const whereActor = actorName ? { name: { [Op.substring]: actorName } } : {};

    const combinedWhere = {
      [Op.or]: [whereTitle, whereActor],
    };

    const whereCondition =
      Object.keys(whereTitle).length > 0 || Object.keys(whereActor).length > 0
        ? combinedWhere
        : {};

    const movies = await this.movieModel.findAll({
      offset,
      limit,
      order: [[Sequelize.fn('lower', Sequelize.col(sort)), order]],
      include: {
        model: Actor,
        where: whereCondition,
      },
    });

    const sortedMovies = sortMoviesAlphabetically(movies, sort);
    const moviesCount = await this.movieModel.count();

    return {
      data: sortedMovies,
      meta: {
        total: moviesCount,
      },
    };
  }

  async import(readableStream: Readable) {
    try {
      const { parse, moviesEntries } = parseByLine();

      const rl = readline.createInterface({
        input: readableStream,
      });

      rl.on('line', parse);

      await events.once(rl, 'close');

      const movies = await Promise.all(
        moviesEntries.map(async (entries) => {
          const createMovieData = Object.fromEntries(entries);
          const createMovieDTO = plainToClass(CreateMovieDTO, createMovieData);

          await validateOrReject(createMovieDTO);

          return createMovieDTO;
        }),
      );

      const importedMovies = await this.sequelize.transaction(
        async (t) =>
          await Promise.allSettled(
            movies.map((movie) => this.create(movie, t)),
          ),
      );

      const importErrors = importedMovies
        .filter((importResult) => importResult.status === 'rejected')
        .map((result) => {
          if (result.status === 'rejected') {
            return result.reason.errorDescription;
          }
        });

      if (importErrors.length > 0) {
        throw new DomainException(HttpStatus.BAD_REQUEST, {
          description: importErrors,
        });
      }

      const savedMovies = importedMovies
        .filter((importResult) => importResult.status === 'fulfilled')
        .map((result) => {
          if (result.status === 'fulfilled') {
            return result.value;
          }
        });
      const moviesCount = await this.movieModel.count();

      return {
        data: savedMovies,
        meta: {
          imported: savedMovies.length,
          total: moviesCount,
        },
      };
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        const validationErrorItem = error.errors[0];
        const description = {
          fields: {
            [validationErrorItem.path]:
              validationErrorItem.validatorKey.toUpperCase(),
          },
          code: ERROR_CODES.MOVIE_EXISTS,
        };
        throw new DomainException(HttpStatus.BAD_REQUEST, description);
      }

      throw error;
    }
  }
}
