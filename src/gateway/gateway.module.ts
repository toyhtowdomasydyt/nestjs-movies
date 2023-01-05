import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [GatewayController],
})
export class GatewayModule {}
