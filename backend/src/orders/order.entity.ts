import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Product } from '../products/products.entity';

@ObjectType()
@Entity()
export class Order {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  customer!: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, { eager: true, nullable: true, onDelete: 'SET NULL' })
  category?: Category;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.orders, {
    eager: true,
    onDelete: 'CASCADE',
  })
  product!: Product;

  @Field(() => Int)
  @Column()
  quantity!: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;

  @Field()
  @Column()
  date!: string;
}
