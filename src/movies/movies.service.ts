import { Readable } from 'node:stream';
import * as readline from 'node:readline';
import * as events from 'node:events';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Movie, MovieDTO } from './movie.model';
import { Actor } from './actor.model';

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
  ) {}

  async create(movieData: MovieDTO) {
    const movie = await this.movieModel.create(
      {
        title: movieData.title,
        year: movieData.year,
        format: movieData.format,
        actors: [...movieData.actors.map((name) => ({ name }))],
      },
      { include: Actor },
    );

    return movie;
  }

  async findByID(id: number) {
    const movie = await this.movieModel.findOne({
      where: { id },
      include: Actor,
    });

    if (!movie) {
      throw new Error('Movie not found');
    }

    return movie;
  }

  async deleteByID(id: number) {
    const movie = await this.findByID(id);

    await movie.destroy();
  }

  async update(id: number, movieData: MovieDTO) {
    const movie = await this.findByID(id);

    movie.set({
      ...movieData,
      actors:
        movieData.actors && Array.isArray(movieData.actors)
          ? movieData.actors.map((name) => ({ name }))
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
      order: [[sort, order]],
      include: {
        model: Actor,
        where: whereCondition,
      },
    });

    const moviesCount = await this.movieModel.count();

    return {
      data: movies,
      meta: {
        total: moviesCount,
      },
    };
  }

  async import(readableStream: Readable) {
    let parsedMovieEntries = [];
    const moviesEntries = [];
    const fieldMap = {
      title: 'title',
      'release year': 'year',
      format: 'format',
      stars: 'actors',
    };
    const fieldParsers = {
      title: (v) => v,
      year: (v) => Number(v),
      format: (v) => v,
      actors: (v) =>
        v.split(', ').map((name) => ({
          name,
        })),
    };

    const rl = readline.createInterface({
      input: readableStream,
    });

    rl.on('line', (line) => {
      if (line) {
        const [field, data] = line.split(':');
        const formattedField = fieldMap[field.trim().toLowerCase()];
        const dataValue = fieldParsers[formattedField](data.trim());

        parsedMovieEntries.push([formattedField, dataValue]);
        return;
      }

      if (parsedMovieEntries.length > 0) {
        moviesEntries.push(parsedMovieEntries);
      }

      parsedMovieEntries = [];
    });

    await events.once(rl, 'close');

    const movies = moviesEntries.map((entries) => Object.fromEntries(entries));
    const savedMovies = await this.movieModel.bulkCreate(movies, {
      include: {
        model: Actor,
        as: 'actors',
      },
    });
    const moviesCount = await this.movieModel.count();

    return {
      data: savedMovies,
      meta: {
        imported: savedMovies.length,
        total: moviesCount,
      },
    };
  }
}
