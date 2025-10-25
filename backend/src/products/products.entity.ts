import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { OrderItem } from '../orders/order-item.entity';
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

  @Field(() => [OrderItem], { nullable: true })
  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems?: OrderItem[];

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
