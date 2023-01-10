import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GatewayModule } from './gateway/gateway.module';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: 'db/database.sqlite',
      autoLoadModels: true,
      synchronize: true,
      define: {
        charset: 'utf8',
        collate: 'UNICODE',
      },
      dialectOptions: {
        charset: 'utf8',
        collate: 'UNICODE',
      },
    }),
    AuthModule,
    UsersModule,
    GatewayModule,
    MoviesModule,
  ],
})
export class AppModule {}
