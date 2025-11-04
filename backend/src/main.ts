import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedDatabase } from './seed';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Request, Response, NextFunction } from 'express'; // ✅ přidáme typy

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:3000',
    'https://admin-alcohol-shop-production.up.railway.app',
  ];

  const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('https://')) {
        console.log('✅ CORS povoleno pro:', origin || '— žádný origin (např. Postman)');
        callback(null, true);
      } else {
        console.warn('❌ CORS zablokováno pro:', origin);
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-apollo-operation-name',
      'apollo-require-preflight',
      'X-Requested-With',
    ],
    credentials: true,
  };

  app.enableCors(corsOptions);

  // 🧩 Logování všech GraphQL requestů (s typy)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/graphql') {
      console.log('📩 GraphQL request zachycen:');
      console.log('  🔹 Method:', req.method);
      console.log('  🔹 Origin:', req.headers.origin);
      console.log('  🔹 Content-Type:', req.headers['content-type']);
      console.log('  🔹 Apollo headers:', {
        operationName: req.headers['x-apollo-operation-name'],
        preflight: req.headers['apollo-require-preflight'],
        requestedWith: req.headers['x-requested-with'],
      });
    }
    next();
  });

  const port = process.env.PORT || 3000;

  if (process.env.RUN_SEED === 'true') {
    console.log('🌱 Spouštím seed databáze (RUN_SEED=true)...');
    await seedDatabase();
  }

  await app.listen(port);
  console.log(`🚀 Server běží na portu ${port} (NODE_ENV=${process.env.NODE_ENV})`);
}

bootstrap();
