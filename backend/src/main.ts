import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedDatabase } from './seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORS ---
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:4200',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
  });

  // --- Jednorázový seed (pouze pokud je RUN_SEED=true) ---
  if (process.env.RUN_SEED === 'true') {
    console.log('🌱 Spouštím seed databáze (RUN_SEED=true)...');
    try {
      await seedDatabase();
      console.log('✅ Seed databáze dokončen.');
    } catch (err) {
      console.error('❌ Chyba při seeding databáze:', err);
    }
  }

  // --- Spuštění serveru ---
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server běží na portu ${port} (NODE_ENV=${process.env.NODE_ENV})`);
}

bootstrap();
