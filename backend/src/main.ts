import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedDatabase } from './seed';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:4200',
    'https://admin-alcohol-shop-production.up.railway.app',
  ];

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      const isLocal =
        origin?.startsWith('http://localhost') ||
        origin?.startsWith('capacitor://') ||
        origin?.startsWith('ionic://');
      const isAllowed = !origin || allowedOrigins.includes(origin) || isLocal;

      if (isAllowed) {
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

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/graphql') {
      console.log('\n📩 GraphQL request zachycen:');
      console.log('  🔹 Method:', req.method);
      console.log('  🔹 Origin:', req.headers.origin || '(žádný)');
      console.log('  🔹 URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
      console.log('  🔹 Content-Type:', req.headers['content-type']);
      console.log('─────────────────────────────');
    }
    next();
  });

  if (process.env.RUN_SEED === 'true') {
    console.log('🌱 Spouštím seed databáze (RUN_SEED=true)...');
    await seedDatabase();
  }

  const port = Number(process.env.PORT) || 3000;
  console.log('🧠 Detekovaný PORT z env:', process.env.PORT);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server běží na portu ${port} (NODE_ENV=${process.env.NODE_ENV})`);
}

bootstrap();
