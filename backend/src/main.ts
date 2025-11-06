import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedDatabase } from './seed';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://admin-alcohol-shop-production.up.railway.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-apollo-operation-name',
      'apollo-require-preflight',
      'Accept',
    ],
    credentials: true,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/graphql') {
      console.log('\n📩 GraphQL request zachycen:');
      console.log('  Method:', req.method);
      console.log('  Origin:', req.headers.origin || '(žádný)');
      console.log('  URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
      console.log('  Content-Type:', req.headers['content-type']);
      console.log('─────────────────────────────');
    }
    next();
  });

  if (process.env.RUN_SEED === 'true') {
    console.log('🌱 Spouštím seed databáze (RUN_SEED=true)...');
    await seedDatabase();
  }

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server běží na portu ${port} (NODE_ENV=${process.env.NODE_ENV})`);
}

bootstrap();
