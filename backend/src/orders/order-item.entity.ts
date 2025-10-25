import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/products.entity';
import { Category } from '../categories/category.entity';

@ObjectType()
@Entity('order_items')
export class OrderItem {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Product)
  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  product!: Product;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, { eager: true, nullable: true, onDelete: 'SET NULL' })
  category?: Category;

  @Field(() => Int)
  @Column({ nullable: false })
  quantity!: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  price!: number;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Order;
}
