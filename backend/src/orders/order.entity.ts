import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/products.entity';

@ObjectType()
@Entity()
export class Order {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Customer)
  @ManyToOne(() => Customer, (customer) => customer.orders, { eager: true })
  customer!: Customer;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.orders, { eager: true })
  product!: Product;

  @Field(() => Int)
  @Column()
  quantity!: number;

  @Field(() => Float)
  @Column('decimal')
  total!: number;

  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
