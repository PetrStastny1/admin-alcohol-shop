import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Field()
  @Column({ default: 'user' })
  role!: string;

  @Field()
  @CreateDateColumn()
  created_at!: Date;

  @Field()
  @Column({ default: true })
  isActive!: boolean;
}
