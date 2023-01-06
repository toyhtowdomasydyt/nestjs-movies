import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
  imports: [UsersModule, AuthModule, MoviesModule],
  controllers: [GatewayController],
})
export class GatewayModule {}
