import { Readable } from 'node:stream';
import {
  Controller,
  Post,
  HttpCode,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  Param,
  Delete,
  Patch,
  UseFilters,
  UsePipes,
  ValidationPipe,
  ParseFilePipe,
  FileTypeValidator,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { MoviesService, MovieQueryOptions } from 'src/movies/movies.service';
import { UsersService } from 'src/users/users.service';
import {
  DomainException,
  DomainExceptionFilter,
  ERROR_CODES,
} from './exception.filter';
import { CreateUserDTO } from 'src/users/createUser.dto';
import { CreateMovieDTO } from 'src/movies/createMovie.dto';
import { validatePipeOptions } from './validatePipe.options';

@UseFilters(new DomainExceptionFilter())
@Controller('v1')
export class GatewayController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly moviesService: MoviesService,
  ) {}

  @UsePipes(new ValidationPipe(validatePipeOptions))
  @Post('users')
  @HttpCode(201)
  async createUser(@Body() userData: CreateUserDTO) {
    const user = await this.usersService.create(userData);
    const { token } = this.authService.login({
      id: user.id,
      email: user.email,
    });

    return {
      token,
      status: 1,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('sessions')
  async loginUser(@Request() req) {
    const user = req.user;
    const { token } = this.authService.login({
      id: user.id,
      email: user.email,
    });

    return {
      token,
      status: 1,
    };
  }

  @UsePipes(new ValidationPipe(validatePipeOptions))
  @UseGuards(JwtAuthGuard)
  @Post('/movies')
  async createMovie(@Body() movieData: CreateMovieDTO) {
    const movie = await this.moviesService.create(movieData);

    return { data: movie, status: 1 };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/movies/:id')
  async deleteMovie(@Param('id') id: number) {
    await this.moviesService.deleteByID(id);

    return { status: 1 };
  }

  @UsePipes(new ValidationPipe(validatePipeOptions))
  @UseGuards(JwtAuthGuard)
  @Patch('/movies/:id')
  async updateMovie(
    @Param('id') id: number,
    @Body() movieData: CreateMovieDTO,
  ) {
    const movie = await this.moviesService.update(id, movieData);

    return { data: movie, status: 1 };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/movies/:id')
  async getMovie(@Param('id') id: number) {
    const movie = await this.moviesService.findByID(id);

    return { data: movie, status: 1 };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/movies')
  async listMovies(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
    @Query('actor') actor: string,
    @Query('title') title: string,
    @Query('search') search: string,
  ) {
    const movies = await this.moviesService.list({
      limit,
      offset,
      sort,
      order,
      actor,
      title,
      search,
    } as MovieQueryOptions);

    return { data: movies.data, meta: movies.meta, status: 1 };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('movies'))
  @Post('movies/import')
  async importMovies(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'text/plain' })],
        exceptionFactory: () =>
          new DomainException(HttpStatus.BAD_REQUEST, {
            code: ERROR_CODES.PLAIN_TXT_FILE_REQUIRED,
          }),
      }),
    )
    file: Express.Multer.File,
  ) {
    const readableStream = Readable.from(file.buffer);
    const movies = await this.moviesService.import(readableStream);

    return { data: movies.data, meta: movies.meta, status: 1 };
  }
}
