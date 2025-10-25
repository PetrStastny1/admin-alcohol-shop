import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsDateString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemInput } from './order-item.input';

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  @IsInt()
  customerId!: number;

  @Field(() => [OrderItemInput])
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items!: OrderItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;
}
