import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { CustomersService } from './customers.service';
import { CustomersResolver } from './customers.resolver';
import { Order } from '../orders/order.entity';
import { Product } from '../products/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Order, Product])],
  providers: [CustomersService, CustomersResolver],
  exports: [CustomersService],
})
export class CustomersModule {}
