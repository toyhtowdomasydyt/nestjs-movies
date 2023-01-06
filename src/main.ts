import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('HTTP_PORT') || 3000;

  await app.listen(port);
}
bootstrap();
