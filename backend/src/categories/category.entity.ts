import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from '../products/products.entity';

@ObjectType()
@Entity()
export class Category {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => [Product], { nullable: 'itemsAndList' })
  @OneToMany(() => Product, (product) => product.category, {
    cascade: ['insert', 'update'],
    onDelete: 'SET NULL',
  })
  products?: Product[];
}
