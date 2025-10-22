import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Order } from '../orders/order.entity';
import { Category } from '../categories/category.entity';

@ObjectType()
@Entity('products')
export class Product {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ length: 255 })
  name!: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field()
  @Column({ default: true })
  isActive!: boolean;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.product)
  orders?: Order[];

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  categoryId?: number;
}
