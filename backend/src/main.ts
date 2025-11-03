import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:4200',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server běží na portu ${port} (${process.env.NODE_ENV})`);
}

bootstrap();
