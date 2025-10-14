import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// --- Moduly aplikace ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloResolver } from './resolvers/hello.resolver';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './auth/admin.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    // --- Globální konfigurace ---
    ConfigModule.forRoot({ isGlobal: true }),

    // --- Databázové připojení ---
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '3306', 10),
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'app_db',
      entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
      synchronize: true,
      logging: process.env.TYPEORM_LOGGING === 'true',
    }),

    // --- GraphQL konfigurace ---
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: true,
      context: ({ req }: { req: any }) => ({ req }),
    }),

    // --- Moduly aplikace ---
    AuthModule,
    AdminModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CustomersModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, HelloResolver],
})
export class AppModule {}
