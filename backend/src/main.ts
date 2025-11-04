import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedDatabase } from './seed';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || origin.startsWith('https://') || origin.startsWith('http://localhost')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-apollo-operation-name',
      'apollo-require-preflight',
    ],
    credentials: true,
  };

  app.enableCors(corsOptions);

  const port = process.env.PORT || 3000;

  if (process.env.RUN_SEED === 'true') {
    console.log('🌱 Spouštím seed databáze (RUN_SEED=true)...');
    await seedDatabase();
  }

  await app.listen(port);
  console.log(`🚀 Server běží na portu ${port} (NODE_ENV=${process.env.NODE_ENV})`);
}

bootstrap();
