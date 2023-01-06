import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Actor } from './actor.model';
import { Movie } from './movie.model';
import { MoviesService } from './movies.service';

@Module({
  imports: [SequelizeModule.forFeature([Movie, Actor])],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
