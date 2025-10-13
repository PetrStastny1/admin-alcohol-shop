import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
  isActive!: boolean;
}
