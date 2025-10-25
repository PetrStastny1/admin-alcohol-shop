import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersResolver } from './customers.resolver';
import { Customer } from './customer.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Product } from '../products/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Order, OrderItem, Product])],
  providers: [CustomersService, CustomersResolver],
  exports: [CustomersService],
})
export class CustomersModule {}
