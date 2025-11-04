import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { validate } from './env.validation';
import { Request } from 'express';
import { existsSync } from 'fs';

// --- Moduly aplikace ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';

// ✅ Automatická detekce buildu Angular frontendu
const pathsToTry = [
  join(process.cwd(), 'frontend', 'dist', 'frontend', 'browser'),
  join(__dirname, '..', 'frontend', 'dist', 'frontend', 'browser'),
  join(__dirname, '..', '..', 'frontend', 'dist', 'frontend', 'browser'),
  join(process.cwd(), 'backend', 'frontend', 'dist', 'frontend', 'browser'),
];

const frontendRoot = pathsToTry.find((p) => existsSync(p)) ?? process.cwd();
console.log('🧭 Angular rootPath:', frontendRoot);

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: frontendRoot,
      exclude: ['/graphql', '/api'],
      serveStaticOptions: { index: 'index.html' },
    }),

    ConfigModule.forRoot({ isGlobal: true, validate }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'app_db',
      autoLoadEntities: true,
      synchronize: true,
      logging: process.env.TYPEORM_LOGGING === 'true',
    }),

    // ✅ GraphQL bez CSRF 
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: true,
      csrfPrevention: false,
      context: ({ req }: { req: Request }) => ({ req }),
    }),

    // ✅ Aplikační moduly
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CustomersModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
