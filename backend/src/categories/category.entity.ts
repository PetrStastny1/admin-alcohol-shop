import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from '../products/products.entity';
import { OrderItem } from '../orders/order-item.entity';

@ObjectType()
@Entity('categories')
export class Category {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ unique: true })
  name!: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive!: boolean;

  @Field(() => [Product], { nullable: true })
  @OneToMany(() => Product, (product) => product.category, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  products?: Product[];

  @Field(() => [OrderItem], { nullable: true })
  @OneToMany(() => OrderItem, (item) => item.category, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  orderItems?: OrderItem[];
}
