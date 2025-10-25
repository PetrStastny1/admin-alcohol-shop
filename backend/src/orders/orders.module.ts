import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/products.entity';
import { Customer } from '../customers/customer.entity';
import { Category } from '../categories/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, Customer, Category])],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService],
})
export class OrdersModule {}
