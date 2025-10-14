import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Order } from '../orders/order.entity';
import { Category } from '../categories/category.entity';

@ObjectType()
@Entity()
export class Product {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field(() => Float)
  @Column('decimal')
  price!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  categoryId?: number;

  @Field()
  @Column({ default: true })
  isActive: boolean = true;

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.product)
  orders?: Order[];

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  category?: Category;
}
