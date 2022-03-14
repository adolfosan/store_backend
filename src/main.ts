import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module'
import { ValidationPipe } from '@nestjs/common'
import * as compression from 'compression'
import * as bodyParser from 'body-parser'
async function bootstrap() {
  const app = await NestFactory.create( AppModule);

  app.setGlobalPrefix('/api/v1')
  app.use( compression());
  app.use( bodyParser.urlencoded({ extended: true}));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3000);
}
bootstrap();
