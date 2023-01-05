import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: 'db/database.sqlite',
      autoLoadModels: true,
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    GatewayModule,
  ],
})
export class AppModule {}
