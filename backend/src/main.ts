import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedDatabase } from './seed';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Povolené originy pro FE (lokální + produkční)
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:3000',
    'https://admin-alcohol-shop-production.up.railway.app',
  ];

  // ✅ CORS konfigurace
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      const safeOrigin =
        !origin ||
        allowedOrigins.includes(origin) ||
        (typeof origin === 'string' && origin.startsWith('https://'));

      if (safeOrigin) {
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

  // 🧩 Logování GraphQL requestů 
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/graphql') {
      console.log('\n📩 GraphQL request zachycen:');
      console.log('  🔹 Method:', req.method);
      console.log('  🔹 Origin:', req.headers.origin || '(žádný)');
      console.log('  🔹 Content-Type:', req.headers['content-type']);
      console.log('  🔹 Apollo headers:', {
        operationName: req.headers['x-apollo-operation-name'],
        preflight: req.headers['apollo-require-preflight'],
        requestedWith: req.headers['x-requested-with'],
      });
      console.log('─────────────────────────────');
    }
    next();
  });

  // ✅ Spuštění seedování, pokud je zapnuto
  if (process.env.RUN_SEED === 'true') {
    console.log('🌱 Spouštím seed databáze (RUN_SEED=true)...');
    await seedDatabase();
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server běží na portu ${port} (NODE_ENV=${process.env.NODE_ENV})`);
}

bootstrap();
