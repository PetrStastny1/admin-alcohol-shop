import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from './order-item.entity';
import { FormattedDateScalar } from '../common/scalars/date.scalar';

@ObjectType()
@Entity('orders')
export class Order {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Customer)
  @ManyToOne(() => Customer, (customer) => customer.orders, {
    eager: true,
    onDelete: 'CASCADE',
  })
  customer!: Customer;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  items!: OrderItem[];

  @Field(() => FormattedDateScalar)
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;
}
