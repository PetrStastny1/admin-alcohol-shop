import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { FormattedDateScalar } from '../common/scalars/date.scalar';

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

  @Field(() => FormattedDateScalar)
  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @Field(() => FormattedDateScalar)
  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;

  @Field()
  @Column({ default: true })
  isActive!: boolean;
}
