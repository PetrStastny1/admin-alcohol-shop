import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { ProductsResolver } from './products.resolver';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsResolver],
  exports: [ProductsService],
})
export class ProductsModule {}
