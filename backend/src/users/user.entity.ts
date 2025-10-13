import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Entity('users')
export class User {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field()
  @CreateDateColumn()
  created_at!: Date;
}
